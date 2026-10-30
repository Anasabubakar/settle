import type { Metadata } from 'expo-router/server';
import { PAGES } from '@/content/site';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { motionDuration, useReducedMotion } from '@/hooks/use-reduced-motion';
import { SettleLottie } from '@/components/settle-lottie';
import { Fonts, SettleColors } from '@/constants/theme';

const slides = [
  { accent: SettleColors.acid, animation: 'bill' as const, eyebrow: '01 · DISCOVER', title: 'Swipe real bills. Fund real relief.', copy: 'Every request is checked. Swipe past, ask a question, or cover any amount.' },
  { accent: SettleColors.orange, animation: 'money' as const, eyebrow: '02 · SETTLE', title: 'Pay in USDC on Stellar.', copy: 'Connect a wallet, choose all or part, then sign one low-fee Stellar transaction.' },
  { accent: SettleColors.pink, animation: 'success' as const, eyebrow: '03 · PROVE', title: 'Every good deed gets a receipt.', copy: 'Track the ledger, transaction hash, provider route, and the people you helped.' },
];

export function generateMetadata(): Metadata {
  return { title: PAGES.onboarding.title, description: PAGES.onboarding.description };
}

export default function OnboardingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const reducedMotion = useReducedMotion();
  const slide = slides[index];

  const finish = async () => {
    await AsyncStorage.setItem('settle:onboarding-complete', 'true');
    router.replace('/discover');
  };

  const advance = () => {
    if (index === slides.length - 1) { void finish(); return; }
    Animated.timing(fade, { duration: motionDuration(reducedMotion, 140), toValue: 0, useNativeDriver: true }).start(() => {
      setIndex((value) => value + 1);
      Animated.timing(fade, { duration: motionDuration(reducedMotion, 240), toValue: 1, useNativeDriver: true }).start();
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}><Text style={styles.brand}>SETTLE</Text><Pressable onPress={() => void finish()}><Text style={styles.skip}>SKIP</Text></Pressable></View>
      <Animated.View style={[styles.content, { opacity: fade }]}> 
        <View style={[styles.artFrame, { backgroundColor: slide.accent }]}>
          <View style={styles.artInner}><SettleLottie loop={slide.animation !== 'success'} style={styles.motion} variant={slide.animation} /></View>
          <View style={styles.starOne}><Text style={styles.star}>◆</Text></View><View style={styles.starTwo}><Text style={styles.star}>◆</Text></View>
        </View>
        <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.copy}>{slide.copy}</Text>
      </Animated.View>
      <View style={styles.footer}>
        <View style={styles.dots}>{slides.map((item, dot) => <View key={item.title} style={[styles.dot, dot === index && styles.dotActive]} />)}</View>
        <Pressable onPress={advance} style={({ pressed }) => [styles.next, pressed && styles.pressed]}><Text style={styles.nextText}>{index === slides.length - 1 ? 'ENTER SETTLE' : 'NEXT →'}</Text></Pressable>
        <Text style={styles.network}>STELLAR TESTNET · PREVIEW</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: SettleColors.ivory, flex: 1, paddingHorizontal: 22 }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 }, brand: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 21 }, skip: { color: SettleColors.muted, fontFamily: Fonts.display, fontSize: 9, letterSpacing: 1 },
  content: { alignItems: 'center', flex: 1, justifyContent: 'flex-start', paddingTop: 24 }, artFrame: { borderColor: SettleColors.ink, borderRadius: 24, borderWidth: 3, flexShrink: 0, height: 280, justifyContent: 'center', maxWidth: 430, padding: 18, shadowColor: SettleColors.ink, shadowOffset: { height: 9, width: 9 }, shadowOpacity: 1, shadowRadius: 0, width: '100%' }, artInner: { alignItems: 'center', backgroundColor: SettleColors.lavender, borderColor: SettleColors.ink, borderRadius: 17, borderWidth: 3, flex: 1, justifyContent: 'center', overflow: 'hidden' }, motion: { height: 220, width: 250 }, starOne: { left: -12, position: 'absolute', top: 30 }, starTwo: { bottom: 24, position: 'absolute', right: -11 }, star: { color: SettleColors.ink, fontSize: 26 }, eyebrow: { alignSelf: 'flex-start', backgroundColor: SettleColors.yellow, borderColor: SettleColors.ink, borderRadius: 7, borderWidth: 2, color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 8, letterSpacing: 1, marginTop: 32, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 5 }, title: { alignSelf: 'stretch', color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 32, letterSpacing: -0.8, lineHeight: 35, marginTop: 14, textTransform: 'uppercase' }, copy: { alignSelf: 'stretch', color: SettleColors.muted, fontFamily: Fonts.body, fontSize: 15, lineHeight: 22, marginTop: 10 },
  footer: { paddingBottom: 16 }, dots: { flexDirection: 'row', gap: 7, justifyContent: 'center', marginBottom: 18 }, dot: { backgroundColor: SettleColors.soft, borderColor: SettleColors.ink, borderRadius: 99, borderWidth: 2, height: 9, width: 9 }, dotActive: { backgroundColor: SettleColors.purple, width: 29 }, next: { alignItems: 'center', backgroundColor: SettleColors.acid, borderColor: SettleColors.ink, borderRadius: 12, borderWidth: 3, paddingVertical: 17, shadowColor: SettleColors.ink, shadowOffset: { height: 5, width: 5 }, shadowOpacity: 1, shadowRadius: 0 }, pressed: { shadowOffset: { height: 1, width: 1 }, transform: [{ translateX: 3 }, { translateY: 3 }] }, nextText: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 12, letterSpacing: 0.7 }, network: { color: SettleColors.muted, fontFamily: Fonts.bodyBold, fontSize: 8, letterSpacing: 1, marginTop: 17, textAlign: 'center' },
});
