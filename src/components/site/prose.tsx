import { Link, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type TextStyle } from 'react-native';

import { ExternalLink } from '@/components/external-link';
import { Fonts, SettleColors } from '@/constants/theme';
import { STATUS_LABEL, type StepStatus } from '@/content/site';

/** Inline link: internal routes use the router, http(s) links open outside the app. */
export function A({ href, children }: { href: string; children: ReactNode }) {
  const external = /^https?:\/\//.test(href);
  if (external) {
    return (
      <ExternalLink href={href as Href & string} style={styles.link} rel="noopener noreferrer">
        {children}
      </ExternalLink>
    );
  }
  return (
    <Link href={href as Href} style={styles.link}>
      {children}
    </Link>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <Text role="heading" aria-level={2} style={styles.h2}>
      {children}
    </Text>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return (
    <Text role="heading" aria-level={3} style={styles.h3}>
      {children}
    </Text>
  );
}

export function P({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return <Text style={[styles.p, style]}>{children}</Text>;
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <View role="list" style={styles.list}>
      {items.map((item, index) => (
        <View key={index} role="listitem" style={styles.listItem}>
          <Text aria-hidden style={styles.bullet}>
            {'■'}
          </Text>
          <Text style={[styles.p, styles.listText]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <H2>{title}</H2>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export function Callout({ title, children, tone = 'warm' }: { title: string; children: ReactNode; tone?: 'warm' | 'cool' }) {
  return (
    <View style={[styles.callout, tone === 'cool' && styles.calloutCool]}>
      <Text style={styles.calloutTitle}>{title}</Text>
      <Text style={styles.calloutText}>{children}</Text>
    </View>
  );
}

const statusTone: Record<StepStatus, { bg: string; fg: string }> = {
  built: { bg: SettleColors.mint, fg: SettleColors.ink },
  simulated: { bg: SettleColors.yellow, fg: SettleColors.ink },
  notBuilt: { bg: SettleColors.blush, fg: SettleColors.ink },
};

/** Status is always spelled out; colour is never the only signal. */
export function StatusBadge({ status }: { status: StepStatus }) {
  const tone = statusTone[status];
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.badgeText, { color: tone.fg }]}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

/** Label/value rows that stack on narrow screens instead of scrolling sideways. */
export function Facts({ rows }: { rows: { label: string; value: ReactNode; status?: StepStatus }[] }) {
  return (
    <View role="list" style={styles.facts}>
      {rows.map((row) => (
        <View key={row.label} role="listitem" style={styles.factRow}>
          <View style={styles.factHead}>
            <Text style={styles.factLabel}>{row.label}</Text>
            {row.status ? <StatusBadge status={row.status} /> : null}
          </View>
          <Text style={[styles.p, styles.factValue]}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  link: {
    color: SettleColors.cobalt,
    fontFamily: Fonts.bodyBold,
    textDecorationLine: 'underline',
  },
  h2: {
    color: SettleColors.ink,
    fontFamily: Fonts.display,
    fontSize: 24,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  h3: {
    color: SettleColors.ink,
    fontFamily: Fonts.display,
    fontSize: 16,
    lineHeight: 22,
  },
  p: {
    color: SettleColors.ink,
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 26,
  },
  section: { gap: 14, marginTop: 44 },
  sectionBody: { gap: 14 },
  list: { gap: 10 },
  listItem: { flexDirection: 'row', gap: 12 },
  bullet: { color: SettleColors.cobalt, fontSize: 9, lineHeight: 26 },
  listText: { flex: 1, minWidth: 0 },
  callout: {
    backgroundColor: SettleColors.yellow,
    borderColor: SettleColors.ink,
    borderRadius: 12,
    borderWidth: 3,
    gap: 6,
    padding: 18,
  },
  calloutCool: { backgroundColor: SettleColors.lavender },
  calloutTitle: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase' },
  calloutText: { color: SettleColors.ink, fontFamily: Fonts.body, fontSize: 16, lineHeight: 25 },
  badge: {
    alignSelf: 'flex-start',
    borderColor: SettleColors.ink,
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  badgeText: { fontFamily: Fonts.display, fontSize: 10, letterSpacing: 0.9, textTransform: 'uppercase' },
  facts: { gap: 12 },
  factRow: {
    backgroundColor: SettleColors.paper,
    borderColor: SettleColors.ink,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
    padding: 16,
  },
  factHead: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  factLabel: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 14, lineHeight: 20 },
  factValue: { minWidth: 0 },
});
