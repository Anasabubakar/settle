import { Link, Slot, usePathname } from 'expo-router';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Fonts, SettleColors } from '@/constants/theme';

export default function AppTabs() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const compact = width < 1080;
  if (pathname === '/' || pathname === '/onboarding') return <Slot />;
  return (
    <View style={styles.shell}>
      {!compact ? <View style={styles.edgeAccent} /> : null}
      <View style={[styles.header, compact && styles.headerCompact]}>
        <View style={styles.headerInner}>
          <View style={[styles.brand, compact && styles.brandCompact]}>
            <View style={styles.brandMark}><Text style={styles.brandGlyph}>S</Text></View>
            <Text style={styles.brandText}>SETTLE</Text>
          </View>

          {!compact ? <View style={styles.nav}>
            <Link href="/discover" style={[styles.navButton, pathname === '/discover' && styles.navButtonActive]}>
              <Text style={[styles.navText, pathname === '/discover' && styles.navTextActive]}>DISCOVER</Text>
            </Link>
            <Link href="/activity" style={[styles.navButton, pathname === '/activity' && styles.navButtonActive]}>
              <Text style={[styles.navText, pathname === '/activity' && styles.navTextActive]}>IMPACT</Text>
            </Link>
            <Link href="/post" style={[styles.navButton, pathname === '/post' && styles.navButtonActive]}>
              <Text style={[styles.navText, pathname === '/post' && styles.navTextActive]}>HOW IT WORKS</Text>
            </Link>
          </View> : null}

          <View style={[styles.account, compact && styles.accountCompact]}>
            {!compact ? <View style={styles.balance}>
              <Text style={styles.balanceLabel}>GIVING BALANCE</Text>
              <Text style={styles.balanceValue}>$2,450</Text>
            </View> : null}
            <Link href="/post" style={styles.postButton} accessibilityLabel="Post a bill">
              <Text style={styles.postButtonText}>POST A BILL</Text>
            </Link>
            <Link href="/profile" style={styles.avatar} accessibilityLabel="Open profile"><Text style={styles.avatarText}>AM</Text></Link>
          </View>
        </View>
      </View>
      <Slot />
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
  brandCompact: { width: 'auto', flex: 1 },
  brandMark: { width: 40, height: 40, borderRadius: 10, borderWidth: 3, borderColor: SettleColors.ink, alignItems: 'center', justifyContent: 'center', backgroundColor: SettleColors.acid, transform: [{ rotate: '-4deg' }], shadowColor: SettleColors.purple, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  brandGlyph: { color: SettleColors.purple, fontSize: 18, fontFamily: Fonts.display },
  brandText: { color: SettleColors.ink, fontSize: 23, fontFamily: Fonts.display, letterSpacing: -0.7 },
  nav: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 2 },
  navButton: { paddingHorizontal: 17, paddingVertical: 10, borderRadius: 10, borderWidth: 2, borderColor: 'transparent' },
  navButtonActive: { backgroundColor: SettleColors.yellow, borderColor: SettleColors.ink },
  navText: { color: SettleColors.ink, fontSize: 11, fontFamily: Fonts.display, letterSpacing: 1 },
  navTextActive: { color: SettleColors.ink },
  account: { width: 340, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12 },
  accountCompact: { width: 'auto' },
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
});
