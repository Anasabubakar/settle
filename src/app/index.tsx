import type { Metadata } from 'expo-router/server';
import { PAGES } from '@/content/site';
import { Link } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { SiteFooter } from '@/components/site/site-footer';
import { SettleLottie } from '@/components/settle-lottie';
import { Fonts, SettleColors } from '@/constants/theme';

const benefits = [
  { color: SettleColors.purple, icon: '↗', title: 'Share the real bill', copy: 'Pick a photo or PDF. In this prototype a simulated review shows how details would be extracted and private ones masked. Your file stays on your device.' },
  { color: SettleColors.orange, icon: '◆', title: 'Get matched', copy: 'Supporters browse sample requests by category and urgency. The people and bills here are sample data.' },
  { color: SettleColors.acid, icon: '₿', title: 'Settle on Stellar', copy: 'The design lets a supporter fund all or part in USDC on Stellar. Today funding is a testnet preview and no real funds move.' },
  { color: SettleColors.pink, icon: '♥', title: 'Keep it human', copy: 'A Kind Gesture is optional and can be declined. Support is never conditional.' },
];

export function generateMetadata(): Metadata {
  return { title: PAGES.home.title, description: PAGES.home.description };
}

export default function LandingScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 1120;
  const mobile = width < 760;
  const float = useRef(new Animated.Value(0)).current;

  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      float.setValue(0);
      return;
    }
    const motion = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { duration: 1800, toValue: 1, useNativeDriver: true }),
        Animated.timing(float, { duration: 1800, toValue: 0, useNativeDriver: true }),
      ]),
    );
    motion.start();
    return () => motion.stop();
  }, [float, reducedMotion]);

  const appHref = mobile ? '/onboarding' : '/discover';

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.brandMark}><Text style={styles.brandGlyph}>S</Text></View>
              <Text style={styles.brandText}>SETTLE</Text>
            </View>
            {!compact ? (
              <View style={styles.nav}>
                <Link href="/how-it-works" style={styles.navText}>HOW IT WORKS</Link>
                <Link href="/about" style={styles.navText}>ABOUT</Link>
                <Link href="/guidelines" style={styles.navText}>GUIDELINES</Link>
              </View>
            ) : null}
            <Link href={appHref} asChild>
              <Pressable style={styles.launchButton}><Text style={styles.launchText}>OPEN APP →</Text></Pressable>
            </Link>
          </View>

          <View style={[styles.hero, compact && styles.heroCompact]}>
            <View style={styles.heroCopy}>
              <View style={styles.pill}><Text style={styles.pillText}>TESTNET PROTOTYPE · SAMPLE DATA</Text></View>
              <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>REAL BILLS.{`\n`}REAL RELIEF.</Text>
              <Text style={[styles.heroAccent, compact && styles.heroAccentCompact]}>ONE SWIPE AWAY.</Text>
              <View style={styles.orangeLine} />
              <Text style={styles.heroBody}>People share essential bills. Supporters choose one and fund any amount, with the intent that the provider is paid directly on Stellar. This prototype runs on testnet with sample data. No real funds move.</Text>
              <View style={[styles.heroActions, compact && styles.heroActionsCompact]}>
                <Link href={appHref} asChild><Pressable style={styles.primaryCta}><Text style={styles.primaryCtaText}>START SWIPING</Text></Pressable></Link>
                <Link href="/post" asChild><Pressable style={styles.secondaryCta}><Text style={styles.secondaryCtaText}>ASK FOR HELP</Text></Pressable></Link>
              </View>
              <View style={styles.trustRow}>
                <Text style={styles.trustItem}>◈ TESTNET ONLY</Text>
                <Text style={styles.trustItem}>◈ SAMPLE DATA</Text>
                <Text style={styles.trustItem}>◈ FILES STAY ON DEVICE</Text>
              </View>
            </View>

            <Animated.View style={[styles.heroVisual, compact && styles.heroVisualCompact, { transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }] }]}> 
              <View style={styles.visualBack} />
              <View style={styles.visualCard}>
                <View style={styles.visualTop}>
                  <SettleLottie style={styles.heroMotion} variant="money" />
                </View>
                <View style={styles.visualLabel}><Text style={styles.visualLabelText}>RENT · DUE IN 3 DAYS</Text><Text style={styles.visualLabelText}>$860</Text></View>
                <View style={styles.personRow}><View style={styles.avatar}><Text style={styles.avatarText}>JM</Text></View><View style={styles.personCopy}><Text style={styles.personName}>JORDAN M.</Text><Text style={styles.personMeta}>Verified bill · Detroit, US</Text></View><Text style={styles.funded}>68%</Text></View>
                <View style={styles.progress}><View style={styles.progressFill} /></View>
                <View style={styles.actionRow}><View style={styles.pass}><Text style={styles.actionText}>← PASS</Text></View><View style={styles.fund}><Text style={styles.actionText}>♥ FUND</Text></View></View>
              </View>
              <View style={styles.stellarChip}><Text style={styles.stellarChipTop}>DESIGNED FOR</Text><Text style={styles.stellarChipMain}>STELLAR USDC</Text><Text style={styles.stellarChipBottom}>TESTNET PREVIEW</Text></View>
            </Animated.View>
          </View>

          <View style={styles.ticker}><Text style={styles.tickerText}>SAMPLE BILLS ◆ PARTIAL OR FULL SUPPORT ◆ STELLAR TESTNET ◆ OPTIONAL KIND GESTURES ◆ NO REAL FUNDS ◆ HUMAN CHOICE</Text></View>

          <View style={styles.section}>
            <View style={styles.sectionPill}><Text style={styles.sectionPillText}>HOW SETTLE WORKS</Text></View>
            <Text style={styles.sectionTitle}>FROM UPLOAD TO RELIEF.{`\n`}WITHOUT THE AWKWARDNESS.</Text>
            <View style={[styles.benefitGrid, compact && styles.benefitGridCompact]}>
              {benefits.map((item, index) => (
                <View key={item.title} style={styles.benefitCard}>
                  <View style={[styles.iconBox, { backgroundColor: item.color }]}><Text style={styles.iconText}>{item.icon}</Text></View>
                  <Text style={styles.stepIndex}>0{index + 1}</Text>
                  <Text style={styles.benefitTitle}>{item.title}</Text>
                  <Text style={styles.benefitCopy}>{item.copy}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.stellarSection, compact && styles.stellarSectionCompact]}>
            <View style={styles.terminal}>
              <Text style={styles.terminalBrand}>SETTLE / STELLAR</Text>
              <Text style={styles.terminalLine}><Text style={styles.orange}>$</Text> build contribution</Text>
              <Text style={styles.terminalMuted}>asset: USDC · amount: 42.50</Text>
              <Text style={styles.terminalMuted}>destination: set by the server</Text>
              <Text style={styles.terminalMuted}>memo: SETTLE-BILL-8402</Text>
              <Text style={styles.terminalSuccess}>(sample output, nothing was sent)</Text>
            </View>
            <View style={styles.stellarCopy}>
              <View style={styles.sectionPill}><Text style={styles.sectionPillText}>BUILT ON STELLAR</Text></View>
              <Text style={styles.stellarTitle}>MONEY MOVES.{`\n`}TRUST STAYS.</Text>
              <Text style={styles.stellarBody}>The intended design is a traceable Stellar payment for each contribution, with partial funding and direct-to-provider settlement. Today the app previews this on testnet. See how it works for what is built and what is not.</Text>
              <View style={styles.stellarPoints}>
                {['Freighter on web; mobile not built', 'Wallet signs; the app holds no key', 'Settlement API chooses the destination', 'Mainnet is not enabled'].map((point) => <Text key={point} style={styles.stellarPoint}>◆ {point}</Text>)}
              </View>
            </View>
          </View>

          <View style={styles.finalCta}>
            <SettleLottie loop={false} style={styles.finalMotion} variant="success" />
            <Text style={styles.finalTitle}>TRY THE PROTOTYPE.</Text>
            <Text style={styles.finalCopy}>Try the prototype. Swipe a sample bill and preview a testnet payment.</Text>
            <Link href={appHref} asChild><Pressable style={styles.finalButton}><Text style={styles.finalButtonText}>LAUNCH SETTLE →</Text></Pressable></Link>
          </View>
          <SiteFooter />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' }, safeArea: { flex: 1 },
  header: { alignItems: 'center', alignSelf: 'center', backgroundColor: SettleColors.ivory, borderBottomColor: SettleColors.ink, borderBottomWidth: 2, flexDirection: 'row', justifyContent: 'space-between', minHeight: 76, paddingHorizontal: 24, width: '100%' },
  brand: { alignItems: 'center', flexDirection: 'row', gap: 10 }, brandMark: { alignItems: 'center', backgroundColor: SettleColors.acid, borderColor: SettleColors.ink, borderRadius: 10, borderWidth: 2, height: 38, justifyContent: 'center', shadowColor: SettleColors.purple, shadowOffset: { height: 4, width: 4 }, shadowOpacity: 1, shadowRadius: 0, transform: [{ rotate: '-4deg' }], width: 38 }, brandGlyph: { color: SettleColors.purple, fontFamily: Fonts.display, fontSize: 17 }, brandText: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 21 },
  nav: { flexDirection: 'row', gap: 30 }, navText: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 9, letterSpacing: 1.1 }, launchButton: { backgroundColor: SettleColors.purple, borderColor: SettleColors.ink, borderRadius: 10, borderWidth: 2, paddingHorizontal: 17, paddingVertical: 12, shadowColor: SettleColors.ink, shadowOffset: { height: 4, width: 4 }, shadowOpacity: 1, shadowRadius: 0 }, launchText: { color: '#FFF9ED', fontFamily: Fonts.display, fontSize: 9, letterSpacing: 0.7 },
  hero: { alignItems: 'center', alignSelf: 'center', flexDirection: 'row', gap: 70, justifyContent: 'center', maxWidth: 1180, minHeight: 650, paddingHorizontal: 26, paddingVertical: 70, width: '100%' }, heroCompact: { flexDirection: 'column', gap: 44, paddingTop: 44 }, heroCopy: { flex: 1, maxWidth: 560 }, pill: { alignSelf: 'flex-start', backgroundColor: SettleColors.acid, borderColor: SettleColors.ink, borderRadius: 999, borderWidth: 2, paddingHorizontal: 13, paddingVertical: 7, shadowColor: SettleColors.ink, shadowOffset: { height: 3, width: 3 }, shadowOpacity: 1, shadowRadius: 0 }, pillText: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 9, letterSpacing: 0.9 }, heroTitle: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 62, letterSpacing: -2.3, lineHeight: 62, marginTop: 22 }, heroTitleCompact: { fontSize: 45, lineHeight: 46 }, heroAccent: { color: SettleColors.purple, fontFamily: Fonts.display, fontSize: 44, letterSpacing: -1.5, lineHeight: 48 }, heroAccentCompact: { fontSize: 31, lineHeight: 36 }, orangeLine: { backgroundColor: SettleColors.orange, borderRadius: 99, height: 5, marginTop: 8, transform: [{ rotate: '-1deg' }], width: 270 }, heroBody: { color: SettleColors.muted, fontFamily: Fonts.body, fontSize: 17, lineHeight: 26, marginTop: 20, maxWidth: 540 }, heroActions: { flexDirection: 'row', gap: 12, marginTop: 26 }, heroActionsCompact: { flexDirection: 'column' }, primaryCta: { alignItems: 'center', backgroundColor: SettleColors.purple, borderColor: SettleColors.ink, borderRadius: 10, borderWidth: 3, paddingHorizontal: 22, paddingVertical: 15, shadowColor: SettleColors.ink, shadowOffset: { height: 5, width: 5 }, shadowOpacity: 1, shadowRadius: 0 }, primaryCtaText: { color: SettleColors.paper, fontFamily: Fonts.display, fontSize: 11 }, secondaryCta: { alignItems: 'center', backgroundColor: SettleColors.paper, borderColor: SettleColors.ink, borderRadius: 10, borderWidth: 3, paddingHorizontal: 22, paddingVertical: 15, shadowColor: SettleColors.ink, shadowOffset: { height: 5, width: 5 }, shadowOpacity: 1, shadowRadius: 0 }, secondaryCtaText: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 11 }, trustRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, marginTop: 28 }, trustItem: { color: SettleColors.ink, fontFamily: Fonts.bodyBold, fontSize: 9, letterSpacing: 0.7 },
  heroVisual: { flex: 1, maxWidth: 470, minHeight: 510, position: 'relative', width: '100%' }, heroVisualCompact: { minHeight: 480 }, visualBack: { backgroundColor: SettleColors.purple, borderColor: SettleColors.ink, borderRadius: 20, borderWidth: 3, bottom: 38, left: 18, position: 'absolute', right: 6, top: 4, transform: [{ rotate: '-2deg' }] }, visualCard: { backgroundColor: SettleColors.paper, borderColor: SettleColors.ink, borderRadius: 18, borderWidth: 3, left: 0, padding: 16, position: 'absolute', right: 16, shadowColor: SettleColors.ink, shadowOffset: { height: 9, width: 9 }, shadowOpacity: 1, shadowRadius: 0, top: 18 }, visualTop: { alignItems: 'center', backgroundColor: SettleColors.lavender, borderColor: SettleColors.ink, borderRadius: 13, borderWidth: 2, height: 230, justifyContent: 'center', overflow: 'hidden' }, heroMotion: { height: 210, width: 250 }, visualLabel: { backgroundColor: SettleColors.yellow, borderColor: SettleColors.ink, borderRadius: 9, borderWidth: 2, flexDirection: 'row', justifyContent: 'space-between', marginTop: 13, padding: 12 }, visualLabelText: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 10 }, personRow: { alignItems: 'center', flexDirection: 'row', marginTop: 15 }, avatar: { alignItems: 'center', backgroundColor: SettleColors.aqua, borderColor: SettleColors.ink, borderRadius: 9, borderWidth: 2, height: 42, justifyContent: 'center', width: 42 }, avatarText: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 11 }, personCopy: { flex: 1, marginLeft: 10 }, personName: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 11 }, personMeta: { color: SettleColors.muted, fontFamily: Fonts.body, fontSize: 9, marginTop: 3 }, funded: { color: SettleColors.purple, fontFamily: Fonts.display, fontSize: 12 }, progress: { backgroundColor: SettleColors.soft, borderColor: SettleColors.ink, borderRadius: 999, borderWidth: 2, height: 13, marginTop: 14, overflow: 'hidden' }, progressFill: { backgroundColor: SettleColors.acid, height: '100%', width: '68%' }, actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 }, pass: { alignItems: 'center', backgroundColor: SettleColors.paper, borderColor: SettleColors.ink, borderRadius: 8, borderWidth: 2, flex: 1, padding: 11 }, fund: { alignItems: 'center', backgroundColor: SettleColors.acid, borderColor: SettleColors.ink, borderRadius: 8, borderWidth: 2, flex: 1, padding: 11 }, actionText: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 10 }, stellarChip: { backgroundColor: SettleColors.ink, borderColor: SettleColors.ink, borderRadius: 12, borderWidth: 3, bottom: 0, padding: 14, position: 'absolute', right: 0, shadowColor: SettleColors.acid, shadowOffset: { height: 5, width: 5 }, shadowOpacity: 1, shadowRadius: 0 }, stellarChipTop: { color: SettleColors.orange, fontFamily: Fonts.display, fontSize: 7 }, stellarChipMain: { color: SettleColors.paper, fontFamily: Fonts.display, fontSize: 15, marginTop: 4 }, stellarChipBottom: { color: SettleColors.aqua, fontFamily: Fonts.bodyBold, fontSize: 7, marginTop: 4 },
  ticker: { backgroundColor: SettleColors.ink, borderBottomColor: SettleColors.ink, borderBottomWidth: 3, borderTopColor: SettleColors.ink, borderTopWidth: 3, overflow: 'hidden', paddingVertical: 16 }, tickerText: { color: SettleColors.acid, fontFamily: Fonts.display, fontSize: 11, letterSpacing: 1.2, textAlign: 'center' }, section: { alignSelf: 'center', maxWidth: 1180, paddingHorizontal: 26, paddingVertical: 90, width: '100%' }, sectionPill: { alignSelf: 'center', backgroundColor: SettleColors.yellow, borderColor: SettleColors.ink, borderRadius: 7, borderWidth: 2, paddingHorizontal: 11, paddingVertical: 5 }, sectionPillText: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 8, letterSpacing: 1 }, sectionTitle: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 36, letterSpacing: -1, lineHeight: 39, marginTop: 18, textAlign: 'center' }, benefitGrid: { flexDirection: 'row', gap: 16, marginTop: 42 }, benefitGridCompact: { flexDirection: 'column' }, benefitCard: { backgroundColor: SettleColors.paper, borderColor: SettleColors.ink, borderRadius: 13, borderWidth: 3, flex: 1, minHeight: 255, padding: 19, shadowColor: SettleColors.ink, shadowOffset: { height: 5, width: 5 }, shadowOpacity: 1, shadowRadius: 0 }, iconBox: { alignItems: 'center', borderColor: SettleColors.ink, borderRadius: 9, borderWidth: 2, height: 46, justifyContent: 'center', width: 46 }, iconText: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 20 }, stepIndex: { color: SettleColors.muted, fontFamily: Fonts.display, fontSize: 8, marginTop: 18 }, benefitTitle: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 17, lineHeight: 20, marginTop: 9, textTransform: 'uppercase' }, benefitCopy: { color: SettleColors.muted, fontFamily: Fonts.body, fontSize: 12, lineHeight: 19, marginTop: 10 },
  stellarSection: { alignItems: 'center', alignSelf: 'center', borderTopColor: SettleColors.ink, borderTopWidth: 2, flexDirection: 'row', gap: 62, maxWidth: 1180, paddingHorizontal: 26, paddingVertical: 90, width: '100%' }, stellarSectionCompact: { flexDirection: 'column-reverse' }, terminal: { backgroundColor: SettleColors.ink, borderColor: SettleColors.ink, borderRadius: 16, borderWidth: 3, flex: 1, maxWidth: 540, padding: 26, shadowColor: SettleColors.acid, shadowOffset: { height: 7, width: 7 }, shadowOpacity: 1, shadowRadius: 0, width: '100%' }, terminalBrand: { color: SettleColors.acid, fontFamily: Fonts.display, fontSize: 10, letterSpacing: 1, marginBottom: 24 }, terminalLine: { color: SettleColors.paper, fontFamily: 'monospace', fontSize: 13, marginTop: 10 }, orange: { color: SettleColors.orange }, terminalMuted: { color: '#C9BFAA', fontFamily: 'monospace', fontSize: 12, lineHeight: 23 }, terminalSuccess: { color: SettleColors.aqua, fontFamily: 'monospace', fontSize: 12, marginTop: 15 }, stellarCopy: { flex: 1 }, stellarTitle: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 39, lineHeight: 42, marginTop: 19 }, stellarBody: { color: SettleColors.muted, fontFamily: Fonts.body, fontSize: 15, lineHeight: 24, marginTop: 17 }, stellarPoints: { gap: 10, marginTop: 22 }, stellarPoint: { color: SettleColors.ink, fontFamily: Fonts.bodyBold, fontSize: 12 },
  finalCta: { alignItems: 'center', backgroundColor: SettleColors.purple, borderColor: SettleColors.ink, borderRadius: 20, borderWidth: 3, marginBottom: 80, marginHorizontal: 24, overflow: 'hidden', paddingHorizontal: 24, paddingVertical: 58, shadowColor: SettleColors.ink, shadowOffset: { height: 9, width: 9 }, shadowOpacity: 1, shadowRadius: 0 }, finalMotion: { height: 110, width: 110 }, finalTitle: { color: SettleColors.paper, fontFamily: Fonts.display, fontSize: 35, marginTop: 8, textAlign: 'center' }, finalCopy: { color: SettleColors.lavender, fontFamily: Fonts.body, fontSize: 15, marginTop: 10, textAlign: 'center' }, finalButton: { backgroundColor: SettleColors.acid, borderColor: SettleColors.ink, borderRadius: 10, borderWidth: 3, marginTop: 24, paddingHorizontal: 23, paddingVertical: 15, shadowColor: SettleColors.ink, shadowOffset: { height: 5, width: 5 }, shadowOpacity: 1, shadowRadius: 0 }, finalButtonText: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 11 },
});
