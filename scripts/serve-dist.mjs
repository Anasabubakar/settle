#!/usr/bin/env node
/**
 * Serves the static web export the way vercel.json says Vercel will: same headers, clean URLs, SPA fallback.
 * For checking a build locally (and for CSP checks in a browser). It is not a production server.
 *
 *   npx expo export --platform web
 *   node scripts/serve-dist.mjs [dist] [port]
 *
 * CSP_CONNECT_EXTRA="http://localhost:8787"   appended to connect-src, mirroring the edit a deployment makes for its API origin.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? 'dist');
const port = Number(process.argv[3] ?? 4173);
const config = JSON.parse(readFileSync(resolve('vercel.json'), 'utf8'));
const extra = process.env.CSP_CONNECT_EXTRA?.trim();
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.ico': 'image/x-icon', '.ttf': 'font/ttf', '.png': 'image/png', '.svg': 'image/svg+xml', '.map': 'application/json' };

const toRegex = (source) => new RegExp(`^${source.replace(/\(\.\*\)/g, '(.*)')}$`);
const rewrites = config.rewrites.map((r) => ({ re: toRegex(r.source), destination: r.destination }));
const headerRules = config.headers.map((h) => ({ re: toRegex(h.source), headers: h.headers }));

function resolveFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const candidates = [clean, `${clean}.html`, join(clean, 'index.html')];
  for (const c of candidates) {
    const file = join(root, c);
    if (file.startsWith(root) && existsSync(file) && statSync(file).isFile()) return file;
  }
  const hit = rewrites.find((r) => r.re.test(pathname));
  return hit ? join(root, hit.destination) : null;
}

createServer((req, res) => {
  const pathname = new URL(req.url ?? '/', 'http://x').pathname;
  const headers = {};
  for (const rule of headerRules) {
    if (!rule.re.test(pathname)) continue;
    for (const { key, value } of rule.headers) {
      headers[key] = key === 'Content-Security-Policy' && extra ? value.replace("connect-src 'self'", `connect-src 'self' ${extra}`) : value;
    }
  }
  const file = resolveFile(pathname);
  if (!file || !existsSync(file)) return res.writeHead(404, headers).end('not found');
  res.writeHead(200, { ...headers, 'content-type': types[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
}).listen(port, '127.0.0.1', () => console.log(`serving ${root} on http://localhost:${port}`));
