import { Link, Slot, usePathname } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts, SettleColors } from '@/constants/theme';

export default function AppTabs() {
  const pathname = usePathname();
  if (pathname === '/' || pathname === '/onboarding') return <Slot />;

  return (
    <View style={styles.shell}>
      <View style={styles.header}>
        <View style={styles.brandMark}><Text style={styles.brandGlyph}>S</Text></View>
        <Text style={styles.brandText}>SETTLE</Text>
        <Link href="/profile" style={styles.wallet}>G...7KD</Link>
      </View>
      <Slot />
      <View style={styles.tabs}>
        <Link href="/discover" style={[styles.tab, pathname === '/discover' && styles.active]}>DISCOVER</Link>
        <Link href="/activity" style={[styles.tab, pathname === '/activity' && styles.active]}>IMPACT</Link>
        <Link href="/post" style={[styles.tab, pathname === '/post' && styles.active]}>POST</Link>
        <Link href="/profile" style={[styles.tab, pathname === '/profile' && styles.active]}>PROFILE</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: SettleColors.ivory },
  header: { alignItems: 'center', backgroundColor: SettleColors.ivory, borderBottomColor: SettleColors.ink, borderBottomWidth: 2, flexDirection: 'row', height: 70, paddingHorizontal: 17 },
  brandMark: { alignItems: 'center', backgroundColor: SettleColors.acid, borderColor: SettleColors.ink, borderRadius: 9, borderWidth: 2, height: 38, justifyContent: 'center', shadowColor: SettleColors.purple, shadowOffset: { height: 3, width: 3 }, shadowOpacity: 1, shadowRadius: 0, transform: [{ rotate: '-4deg' }], width: 38 },
  brandGlyph: { color: SettleColors.purple, fontFamily: Fonts.display, fontSize: 16 },
  brandText: { color: SettleColors.ink, flex: 1, fontFamily: Fonts.display, fontSize: 20, marginLeft: 11 },
  wallet: { backgroundColor: SettleColors.pink, borderColor: SettleColors.ink, borderRadius: 8, borderWidth: 2, color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 9, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 9 },
  tabs: { backgroundColor: SettleColors.paper, borderColor: SettleColors.ink, borderRadius: 14, borderWidth: 3, bottom: 10, flexDirection: 'row', left: 12, padding: 6, position: 'absolute', right: 12, shadowColor: SettleColors.ink, shadowOffset: { height: 5, width: 5 }, shadowOpacity: 1, shadowRadius: 0, zIndex: 50 },
  tab: { borderRadius: 8, color: SettleColors.muted, flex: 1, fontFamily: Fonts.display, fontSize: 8, overflow: 'hidden', paddingVertical: 13, textAlign: 'center' },
  active: { backgroundColor: SettleColors.yellow, color: SettleColors.ink },
});
