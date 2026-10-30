import { Link, Slot, usePathname, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { PageMeta } from '@/components/site/page-meta';
import { TestnetStrip } from '@/components/site/testnet-strip';
import { Fonts, SettleColors } from '@/constants/theme';
import { PAGES } from '@/content/site';

const META = {
  '/': PAGES.home,
  '/discover': PAGES.discover,
  '/activity': PAGES.activity,
  '/post': PAGES.post,
  '/profile': PAGES.profile,
  '/onboarding': PAGES.onboarding,
  '/how-it-works': PAGES.howItWorks,
  '/guidelines': PAGES.guidelines,
  '/about': PAGES.about,
  '/faq': PAGES.faq,
  '/privacy': PAGES.privacy,
  '/terms': PAGES.terms,
} as const;

const NAV: { href: Href; label: string }[] = [
  { href: '/discover', label: 'DISCOVER' },
  { href: '/activity', label: 'IMPACT' },
  { href: '/how-it-works', label: 'HOW IT WORKS' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'ABOUT' },
];

const MENU: { title: string; items: { href: Href; label: string }[] }[] = [
  {
    title: 'Product',
    items: [
      { href: '/how-it-works', label: 'How it works' },
      { href: '/discover', label: 'Discover' },
      { href: '/post', label: 'Post a bill' },
      { href: '/activity', label: 'Impact' },
    ],
  },
  {
    title: 'Project',
    items: [
      { href: '/about', label: 'About' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: '/guidelines', label: 'Guidelines' },
    ],
  },
];

/** Compact-width menu button; the panel is rendered by SiteMenuPanel under the header. */
function SiteMenuButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={open ? 'Close menu' : 'Open menu'}
      aria-expanded={open}
      aria-controls="site-menu"
      onPress={onToggle}
      style={styles.menuButton}>
      <Text style={styles.menuButtonText}>{open ? 'CLOSE' : 'MENU'}</Text>
    </Pressable>
  );
}

/** The same destinations as the wide header, reachable by keyboard. */
function SiteMenuPanel() {
  return (
    <View id="site-menu" role="navigation" aria-label="Site menu" style={styles.menuPanel}>
      {MENU.map((group) => (
        <View key={group.title} style={styles.menuGroup}>
          <Text role="heading" aria-level={2} style={styles.menuTitle}>{group.title}</Text>
          {group.items.map((item) => (
            <Link key={item.label} href={item.href} style={styles.menuLink}>{item.label}</Link>
          ))}
        </View>
      ))}
    </View>
  );
}

export default function AppTabs() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [pathname]);
  const compact = width < 1200;
  const meta = (META as Record<string, { title: string; description: string }>)[pathname];
  const skip = <a className="skip-link" href="#main">Skip to main content</a>;
  if (pathname === '/' || pathname === '/onboarding') {
    return (
      <View style={styles.shell}>
        {skip}
      {meta ? <PageMeta {...meta} /> : null}
        <TestnetStrip />
        <View role="main" id="main" tabIndex={-1} style={styles.slot}><Slot /></View>
      </View>
    );
  }
  return (
    <View style={styles.shell}>
      {skip}
      {meta ? <PageMeta {...meta} /> : null}
      <TestnetStrip />
      {!compact ? <View style={styles.edgeAccent} /> : null}
      <View style={styles.headerWrap}>
      <View style={[styles.header, compact && styles.headerCompact]}>
        <View style={styles.headerInner}>
          <View style={[styles.brand, compact && styles.brandCompact]}>
            <View style={styles.brandMark}><Text style={styles.brandGlyph}>S</Text></View>
            <Text style={[styles.brandText, compact && styles.brandTextCompact]}>SETTLE</Text>
          </View>

          {!compact ? <View role="navigation" aria-label="Primary" style={styles.nav}>
            {NAV.map((item) => {
              const active = pathname === (item.href as string);
              return (
                <Link key={item.label} href={item.href} aria-current={active ? 'page' : undefined} style={[styles.navButton, active && styles.navButtonActive]}>
                  <Text style={[styles.navText, active && styles.navTextActive]}>{item.label}</Text>
                </Link>
              );
            })}
          </View> : null}

          <View style={[styles.account, compact && styles.accountCompact]}>
            {!compact ? <View style={styles.balance}>
              <Text style={styles.balanceLabel}>SAMPLE BALANCE</Text>
              <Text style={styles.balanceValue}>$2,450</Text>
            </View> : null}
            <Link href="/post" style={[styles.postButton, compact && styles.postButtonCompact]} accessibilityLabel="Post a bill">
              <Text style={styles.postButtonText}>POST A BILL</Text>
            </Link>
            {compact ? <SiteMenuButton open={menuOpen} onToggle={() => setMenuOpen((value) => !value)} /> : <Link href="/profile" style={styles.avatar} accessibilityLabel="Open profile"><Text style={styles.avatarText}>AM</Text></Link>}
          </View>
        </View>
      </View>
      {compact && menuOpen ? <SiteMenuPanel /> : null}
      </View>
      <View role="main" id="main" tabIndex={-1} style={styles.slot}><Slot /></View>
      {compact ? (
        <View style={styles.mobileNav}>
          <Link href="/discover" style={[styles.mobileNavItem, pathname === '/discover' && styles.mobileNavItemActive]}>DISCOVER</Link>
          <Link href="/activity" style={[styles.mobileNavItem, pathname === '/activity' && styles.mobileNavItemActive]}>IMPACT</Link>
          <Link href="/post" style={[styles.mobileNavItem, pathname === '/post' && styles.mobileNavItemActive]}>POST</Link>
          <Link href="/profile" style={[styles.mobileNavItem, pathname === '/profile' && styles.mobileNavItemActive]}>PROFILE</Link>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: 'transparent' },
  edgeAccent: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 9, backgroundColor: SettleColors.purple, zIndex: 60, borderLeftWidth: 3, borderLeftColor: SettleColors.ink },
  header: { height: 82, paddingHorizontal: 30, borderBottomWidth: 3, borderBottomColor: SettleColors.line, backgroundColor: SettleColors.ivory, zIndex: 20 },
  headerCompact: { height: 68, paddingHorizontal: 16 },
  headerInner: { width: '100%', maxWidth: 1440, height: '100%', alignSelf: 'center', flexDirection: 'row', alignItems: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', width: 245, gap: 11 },
  brandCompact: { width: 'auto', flex: 1, minWidth: 0 },
  brandMark: { width: 40, height: 40, borderRadius: 10, borderWidth: 3, borderColor: SettleColors.ink, alignItems: 'center', justifyContent: 'center', backgroundColor: SettleColors.acid, transform: [{ rotate: '-4deg' }], shadowColor: SettleColors.purple, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  brandGlyph: { color: SettleColors.purple, fontSize: 18, fontFamily: Fonts.display },
  brandText: { color: SettleColors.ink, fontSize: 23, fontFamily: Fonts.display, letterSpacing: -0.7 },
  nav: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 2 },
  navButton: { paddingHorizontal: 17, paddingVertical: 10, borderRadius: 10, borderWidth: 2, borderColor: 'transparent' },
  navButtonActive: { backgroundColor: SettleColors.yellow, borderColor: SettleColors.ink },
  navText: { color: SettleColors.ink, fontSize: 11, fontFamily: Fonts.display, letterSpacing: 1 },
  navTextActive: { color: SettleColors.ink },
  account: { width: 340, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12 },
  accountCompact: { width: 'auto', gap: 8 },
  balance: { alignItems: 'flex-end' },
  balanceLabel: { color: SettleColors.muted, fontSize: 9, fontFamily: Fonts.bodyBold, letterSpacing: 0.8 },
  balanceValue: { color: SettleColors.ink, fontSize: 15, fontFamily: Fonts.bodyBold },
  postButton: { backgroundColor: SettleColors.purple, borderWidth: 3, borderColor: SettleColors.ink, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 13, shadowColor: SettleColors.ink, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  postButtonText: { color: '#FFFFFF', fontSize: 11, fontFamily: Fonts.display, letterSpacing: 0.6 },
  avatar: { width: 42, height: 42, borderRadius: 11, borderWidth: 3, borderColor: SettleColors.ink, backgroundColor: SettleColors.pink, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: SettleColors.ink, fontSize: 11, fontFamily: Fonts.display },
  mobileNav: { position: 'absolute', left: 12, right: 12, bottom: 10, minHeight: 62, zIndex: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: SettleColors.paper, borderWidth: 3, borderColor: SettleColors.ink, borderRadius: 14, padding: 6, shadowColor: SettleColors.ink, shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0 },
  mobileNavItem: { flex: 1, textAlign: 'center', color: SettleColors.muted, fontSize: 9, fontFamily: Fonts.display, letterSpacing: 0.5, paddingVertical: 13, borderRadius: 8 },
  mobileNavItemActive: { color: SettleColors.ink, backgroundColor: SettleColors.yellow },
  slot: { flex: 1 },
  brandTextCompact: { fontSize: 19 },
  postButtonCompact: { paddingHorizontal: 11, paddingVertical: 12 },
  headerWrap: { zIndex: 30 },
  menuButton: { backgroundColor: SettleColors.paper, borderColor: SettleColors.ink, borderRadius: 10, borderWidth: 3, minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  menuButtonText: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 10, letterSpacing: 0.6 },
  menuPanel: { backgroundColor: SettleColors.paper, borderBottomColor: SettleColors.ink, borderBottomWidth: 3, left: 0, paddingHorizontal: 16, paddingVertical: 12, position: 'absolute', right: 0, top: '100%' },
  menuGroup: { paddingVertical: 6 },
  menuTitle: { color: SettleColors.muted, fontFamily: Fonts.display, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  menuLink: { color: SettleColors.ink, fontFamily: Fonts.bodyBold, fontSize: 17, paddingVertical: 11 },
});
