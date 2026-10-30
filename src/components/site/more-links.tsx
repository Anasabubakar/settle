import { Link, type Href } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { ExternalLink } from '@/components/external-link';
import { Fonts, SettleColors } from '@/constants/theme';
import { APP_VERSION, REPO } from '@/content/site';

const INTERNAL: { label: string; href: Href }[] = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Community guidelines', href: '/guidelines' },
  { label: 'About Settle', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Privacy policy', href: '/privacy' },
  { label: 'Terms of use', href: '/terms' },
];

/** A More section for the Profile screen on iOS and Android; web uses the header and footer instead. */
export function MoreLinks() {
  if (Platform.OS === 'web') return null;
  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.title}>More</Text>
      {INTERNAL.map((item) => (
        <Link key={item.label} href={item.href} style={styles.row}>
          {item.label}
        </Link>
      ))}
      <ExternalLink href={REPO.app as Href & string} style={styles.row}>Source code on GitHub</ExternalLink>
      <ExternalLink href={REPO.security as Href & string} style={styles.row}>Security policy</ExternalLink>
      <Text style={styles.meta}>Settle v{APP_VERSION} · Testnet prototype · MIT licensed</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: SettleColors.paper, borderColor: SettleColors.ink, borderRadius: 12, borderWidth: 3, marginTop: 24, padding: 18 },
  title: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 14, letterSpacing: 0.8, marginBottom: 6, textTransform: 'uppercase' },
  row: { color: SettleColors.ink, fontFamily: Fonts.bodyBold, fontSize: 16, paddingVertical: 13 },
  meta: { color: SettleColors.muted, fontFamily: Fonts.body, fontSize: 13, marginTop: 8 },
});
