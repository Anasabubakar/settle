import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type Header = { key: string; value: string };
const config = JSON.parse(readFileSync(join(__dirname, '../vercel.json'), 'utf8')) as {
  buildCommand: string;
  outputDirectory: string;
  cleanUrls: boolean;
  rewrites: { source: string; destination: string }[];
  headers: { source: string; headers: Header[] }[];
};
const allHeaders = config.headers.find((h) => h.source === '/(.*)')!.headers;
const header = (key: string) => allHeaders.find((h) => h.key.toLowerCase() === key.toLowerCase())?.value ?? '';
const directives = Object.fromEntries(
  header('Content-Security-Policy').split(';').map((d) => d.trim()).filter(Boolean).map((d) => {
    const [name, ...values] = d.split(/\s+/);
    return [name, values];
  }),
) as Record<string, string[]>;

describe('vercel.json', () => {
  it('builds the static web export into dist', () => {
    expect(config.buildCommand).toBe('npx expo export --platform web');
    expect(config.outputDirectory).toBe('dist');
    expect(config.cleanUrls).toBe(true);
  });

  it('falls back to the SPA shell for deep links but never for static assets', () => {
    const re = new RegExp(`^${config.rewrites[0].source}$`);
    expect(config.rewrites[0].destination).toBe('/index.html');
    for (const path of ['/discover', '/how-it-works', '/unknown/deep/link', '/']) expect(re.test(path)).toBe(true);
    for (const path of ['/_expo/static/js/web/entry.js', '/assets/node_modules/font.ttf', '/favicon.ico']) expect(re.test(path)).toBe(false);
  });

  it('sets the required security headers', () => {
    expect(header('X-Content-Type-Options')).toBe('nosniff');
    expect(header('Referrer-Policy')).toBe('no-referrer');
    expect(header('Permissions-Policy')).toMatch(/camera=\(\)/);
    expect(header('Strict-Transport-Security')).toMatch(/max-age=\d{7,}/);
    expect(header('X-Frame-Options')).toBe('DENY');
  });

  it('keeps the CSP strict: no unsafe-eval, no inline scripts except the pinned hydrate script, no wildcards', () => {
    expect(directives['default-src']).toEqual(["'none'"]);
    expect(directives['frame-ancestors']).toEqual(["'none'"]);
    expect(directives['object-src']).toEqual(["'none'"]);
    expect(directives['base-uri']).toEqual(["'none'"]);
    expect(directives['form-action']).toEqual(["'none'"]);
    for (const [name, values] of Object.entries(directives)) {
      expect(values).not.toContain("'unsafe-eval'");
      expect(values).not.toContain('*');
      if (name !== 'style-src') expect(values).not.toContain("'unsafe-inline'");
    }
    const hash = createHash('sha256').update('globalThis.__EXPO_ROUTER_HYDRATE__=true;').digest('base64');
    expect(directives['script-src']).toEqual(["'self'", `'sha256-${hash}'`]);
  });

  it('allows connections only to the app origin by default (API origins are added per deployment)', () => {
    expect(directives['connect-src']).toEqual(["'self'"]);
  });
});
