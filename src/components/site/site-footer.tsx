import { Link, type Href } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { ExternalLink } from '@/components/external-link';
import { Fonts, SettleColors } from '@/constants/theme';
import { APP_VERSION, REPO } from '@/content/site';

type Item = { label: string; href: string };

const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: 'Product',
    items: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Discover', href: '/discover' },
      { label: 'Post a bill', href: '/post' },
    ],
  },
  {
    title: 'Project',
    items: [
      { label: 'About', href: '/about' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Open source',
    items: [
      { label: 'settle on GitHub', href: REPO.app },
      { label: 'settle-api on GitHub', href: REPO.api },
      { label: 'Issues', href: REPO.issues },
      { label: 'Contributing', href: REPO.contributing },
      { label: 'Security policy', href: REPO.security },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Guidelines', href: '/guidelines' },
    ],
  },
];

export function FooterLink({ label, href }: Item) {
  if (/^https?:\/\//.test(href)) {
    return (
      <ExternalLink href={href as Href & string} style={styles.link} rel="noopener noreferrer">
        {label}
      </ExternalLink>
    );
  }
  return (
    <Link href={href as Href} style={styles.link}>
      {label}
    </Link>
  );
}

/** Site footer. `webOnly` hides it on iOS/Android, where the Profile screen has a More section. */
export function SiteFooter({ webOnly = false }: { webOnly?: boolean }) {
  if (webOnly && Platform.OS !== 'web') return null;
  return (
    <View role="contentinfo" style={styles.footer}>
      <View style={styles.inner}>
        <View role="navigation" aria-label="Footer" style={styles.groups}>
          {GROUPS.map((group) => (
            <View key={group.title} style={styles.group}>
              <Text role="heading" aria-level={2} style={styles.groupTitle}>
                {group.title}
              </Text>
              {group.items.map((item) => (
                <FooterLink key={item.href} {...item} />
              ))}
            </View>
          ))}
        </View>
        <View style={styles.meta}>
          <View style={styles.label}>
            <Text style={styles.labelText}>Testnet prototype</Text>
          </View>
          <Text style={styles.metaText}>
            Settle v{APP_VERSION}. Sample data only. No real funds move. MIT licensed.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: SettleColors.ink,
    borderTopColor: SettleColors.ink,
    borderTopWidth: 3,
    marginTop: 64,
    paddingBottom: 130,
    paddingHorizontal: 16,
    paddingTop: 40,
    width: '100%',
  },
  inner: { alignSelf: 'center', gap: 32, maxWidth: 1100, width: '100%' },
  groups: { columnGap: 32, flexDirection: 'row', flexWrap: 'wrap', rowGap: 28 },
  group: { flexBasis: 150, flexGrow: 1, minWidth: 140 },
  groupTitle: {
    color: SettleColors.acid,
    fontFamily: Fonts.display,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  link: {
    color: SettleColors.paper,
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    lineHeight: 22,
    paddingVertical: 8,
    textDecorationLine: 'underline',
  },
  meta: { alignItems: 'flex-start', borderTopColor: '#5A5149', borderTopWidth: 1, gap: 10, paddingTop: 22 },
  label: {
    backgroundColor: SettleColors.yellow,
    borderColor: SettleColors.paper,
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  labelText: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 10, letterSpacing: 0.9, textTransform: 'uppercase' },
  metaText: { color: '#E8DFCF', fontFamily: Fonts.body, fontSize: 14, lineHeight: 21 },
});
