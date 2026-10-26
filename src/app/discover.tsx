import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BillCard } from '@/components/bill-card';
import { ContributionSheet } from '@/components/contribution-sheet';
import { KindGestureSheet, type KindGestureRequest } from '@/components/kind-gesture-sheet';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { SettleLottie } from '@/components/settle-lottie';
import { demoBills, formatMoney } from '@/data/bills';
import { Fonts, SettleColors } from '@/constants/theme';
import type { Bill, BillCategory, Money } from '@/types/domain';

type Filter = 'all' | BillCategory;

const filters: { id: Filter; label: string; description: string }[] = [
  { id: 'all', label: 'For you', description: 'Based on your giving preferences' },
  { id: 'electricity', label: 'Utilities', description: 'Power, water and heating' },
  { id: 'medical', label: 'Health', description: 'Care and prescriptions' },
  { id: 'education', label: 'Education', description: 'Fees and learning access' },
];

export default function DiscoverScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 880;
  const expansive = width >= 1260;
  const reducedMotion = useReducedMotion();
  const [filter, setFilter] = useState<Filter>('all');
  const [cursor, setCursor] = useState(0);
  const [fundingBill, setFundingBill] = useState<Bill | null>(null);
  const [gestureBill, setGestureBill] = useState<Bill | null>(null);
  const [gesture, setGesture] = useState<KindGestureRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{ bill: Bill; amount: Money } | null>(null);

  const visibleBills = useMemo(() => {
    const open = demoBills.filter((bill) => bill.status === 'open');
    if (filter === 'all') return open;
    if (filter === 'electricity') return open.filter((bill) => ['electricity', 'water', 'heating'].includes(bill.category));
    return open.filter((bill) => bill.category === filter);
  }, [filter]);
  const activeBill = visibleBills[cursor % Math.max(visibleBills.length, 1)];

  const advance = () => setCursor((value) => value + 1);
  const chooseFilter = (next: Filter) => { setFilter(next); setCursor(0); };
  const openFunding = (bill: Bill) => setFundingBill(bill);
  const openGesture = (bill: Bill) => setGestureBill(bill);
  const submitGesture = (request: KindGestureRequest, bill: Bill) => {
    setGesture(request);
    setGestureBill(null);
    setFundingBill(bill);
  };
  const confirmContribution = (amount: Money, bill: Bill) => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setFundingBill(null);
      setReceipt({ amount, bill });
    }, 650);
  };
  const keepBrowsing = () => { setReceipt(null); setGesture(null); advance(); };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.shell, !wide && styles.shellCompact]}>
            {wide ? (
              <View style={styles.sidebar}>
                <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>AI-MATCHED · VERIFIED</Text></View>
                <Text style={styles.sideTitle}>SWIPE A BILL.{`\n`}CHANGE A WEEK.</Text>
                <View style={styles.heroUnderline} />
                <Text style={styles.sideIntro}>Real bills. Direct settlement. You choose how much—and whether your help asks for anything back.</Text>
                <View style={styles.filterList}>
                  {filters.map((item) => {
                    const selected = filter === item.id;
                    return (
                      <Pressable key={item.id} onPress={() => chooseFilter(item.id)} style={({ pressed }) => [styles.filter, selected && styles.filterActive, pressed && styles.pressed]}>
                        <Text style={[styles.filterLabel, selected && styles.filterLabelActive]}>{item.label}</Text>
                        <Text style={[styles.filterDescription, selected && styles.filterDescriptionActive]}>{item.description}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.safetyNote}>
                  <Text style={styles.safetyMark}>✓</Text>
                  <Text style={styles.safetyText}>Identity, bill, and provider details are checked before a request appears here.</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.deckColumn}>
              <View style={styles.deckHeader}>
                <View>
                  <Text style={styles.kicker}>TODAY&apos;S MATCH</Text>
                  <Text style={styles.heading}>Meet the ask.</Text>
                </View>
                <View style={styles.deckCount}><Text style={styles.deckCountText}>{visibleBills.length} open</Text></View>
              </View>

              {!wide ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobileFilters}>
                  {filters.map((item) => (
                    <Pressable key={item.id} onPress={() => chooseFilter(item.id)} style={[styles.mobileFilter, filter === item.id && styles.mobileFilterActive]}>
                      <Text style={[styles.mobileFilterText, filter === item.id && styles.mobileFilterTextActive]}>{item.label}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : null}

              <View style={styles.deckStage}>
                {activeBill ? (
                  <>
                    <View style={styles.backCard} />
                    <BillCard bill={activeBill} onPass={advance} onAsk={openGesture} onFund={openFunding} />
                  </>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No open bills in this category</Text>
                    <Text style={styles.emptyText}>Try another cause or return to your full set of matches.</Text>
                    <Pressable onPress={() => chooseFilter('all')} style={styles.emptyButton}><Text style={styles.emptyButtonText}>Show all matches</Text></Pressable>
                  </View>
                )}
              </View>
              <Text style={styles.swipeHint}>Swipe left to pass. Swipe right to choose an amount.</Text>
            </View>

            {expansive ? (
              <View style={styles.rightRail}>
                <View style={styles.impactCard}>
                  <Text style={styles.impactLabel}>YOUR IMPACT</Text>
                  <Text style={styles.impactAmount}>$4,860</Text>
                  <Text style={styles.impactCaption}>9 essential bills settled this season</Text>
                  <View style={styles.impactRule} />
                  <View style={styles.impactRow}><Text style={styles.impactKey}>People supported</Text><Text style={styles.impactValue}>13</Text></View>
                  <View style={styles.impactRow}><Text style={styles.impactKey}>Giving balance</Text><Text style={styles.impactValue}>$2,450</Text></View>
                </View>
                <View style={styles.promiseCard}>
                  <Text style={styles.promiseTitle}>Support without strings</Text>
                  <Text style={styles.promiseText}>Kind Gestures are optional. Members can decline them without affecting a contribution.</Text>
                  <View style={styles.promiseDivider} />
                  <Text style={styles.promiseFooter}>Payments go directly to verified providers whenever possible.</Text>
                </View>
              </View>
            ) : null}
          </View>
          <View style={styles.marquee}>
            <Text style={styles.marqueeText}>VERIFIED BILLS  ✦  DIRECT PAYMENTS  ✦  PARTIAL OR FULL SUPPORT  ✦  OPTIONAL KIND GESTURES  ✦  HUMAN CHOICE, AI CLARITY</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {fundingBill ? (
        <ContributionSheet visible bill={fundingBill} submitting={submitting} onClose={() => setFundingBill(null)} onConfirm={confirmContribution} />
      ) : null}
      {gestureBill ? (
        <KindGestureSheet visible bill={gestureBill} onClose={() => setGestureBill(null)} onSubmit={submitGesture} />
      ) : null}

      <Modal visible={Boolean(receipt)} transparent animationType={reducedMotion ? 'none' : 'fade'} onRequestClose={keepBrowsing}>
        <View style={styles.receiptOverlay}>
          <View style={styles.receiptCard}>
            <SettleLottie loop={false} style={styles.successMotion} variant="success" />
            <Text style={styles.receiptTitle}>Payment preview saved</Text>
            {receipt ? (
              <Text style={styles.receiptText}>
                Your testnet payment preview covers {formatMoney(receipt.amount)} of {receipt.bill.requester.displayName}&apos;s {receipt.bill.category} bill.
              </Text>
            ) : null}
            <View style={styles.receiptDetail}>
              <Text style={styles.receiptDetailLabel}>Settlement route</Text>
              <Text style={styles.receiptDetailValue}>Stellar testnet preview · no funds moved</Text>
              <View style={styles.chainReceipt}><Text style={styles.chainReceiptKey}>MEMO</Text><Text style={styles.chainReceiptValue}>SETTLE-{receipt?.bill.id.slice(0, 14).toUpperCase()}</Text></View>
              <View style={styles.chainReceipt}><Text style={styles.chainReceiptKey}>REQUIRES</Text><Text style={styles.chainReceiptValue}>VERIFIED QUOTE + SIGNATURE</Text></View>
              {gesture && gesture.gesture !== 'none' ? <Text style={styles.gestureAdded}>Optional Kind Gesture added</Text> : null}
            </View>
            <Pressable onPress={keepBrowsing} style={({ pressed }) => [styles.keepButton, pressed && styles.pressed]}><Text style={styles.keepButtonText}>Keep browsing</Text></Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingTop: 44, paddingBottom: 120 },
  shell: { width: '100%', maxWidth: 1420, alignSelf: 'center', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 34, paddingHorizontal: 28 },
  shellCompact: { maxWidth: 620 },
  sidebar: { width: 325, paddingTop: 12 },
  heroBadge: { alignSelf: 'flex-start', backgroundColor: SettleColors.acid, borderWidth: 2, borderColor: SettleColors.ink, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, transform: [{ rotate: '-1deg' }], shadowColor: SettleColors.ink, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0 },
  heroBadgeText: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 10, letterSpacing: 0.9 },
  sideTitle: { color: SettleColors.ink, fontSize: 48, lineHeight: 49, fontFamily: Fonts.display, letterSpacing: -1.2, marginTop: 22 },
  heroUnderline: { width: 220, height: 5, borderRadius: 99, backgroundColor: SettleColors.orange, marginTop: 8, transform: [{ rotate: '-2deg' }] },
  sideIntro: { color: SettleColors.ink, fontFamily: Fonts.bodyMedium, fontSize: 17, lineHeight: 25, marginTop: 18, maxWidth: 355 },
  filterList: { gap: 8, marginTop: 30 },
  filter: { paddingHorizontal: 15, paddingVertical: 12, borderRadius: 11, borderWidth: 2, borderColor: 'transparent' },
  filterActive: { backgroundColor: SettleColors.purple, borderColor: SettleColors.ink, shadowColor: SettleColors.ink, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  filterLabel: { color: SettleColors.ink, fontSize: 13, fontFamily: Fonts.bodyBold },
  filterLabelActive: { color: '#FFFFFF' },
  filterDescription: { color: SettleColors.muted, fontSize: 11, fontFamily: Fonts.body, marginTop: 3 },
  filterDescriptionActive: { color: '#FFFFFF' },
  pressed: { opacity: 0.68, transform: [{ scale: 0.99 }] },
  safetyNote: { flexDirection: 'row', gap: 9, marginTop: 25, padding: 14, borderWidth: 2, borderColor: SettleColors.line, borderRadius: 12, backgroundColor: SettleColors.paper },
  safetyMark: { color: SettleColors.emerald, fontWeight: '900' },
  safetyText: { flex: 1, color: SettleColors.ink, fontFamily: Fonts.bodyMedium, fontSize: 11, lineHeight: 17 },
  deckColumn: { width: '100%', maxWidth: 540, padding: 8 },
  deckHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 },
  kicker: { color: SettleColors.ink, fontSize: 9, fontFamily: Fonts.display, letterSpacing: 1.2 },
  heading: { color: SettleColors.ink, fontSize: 25, fontFamily: Fonts.display, letterSpacing: -0.6, marginTop: 5 },
  deckCount: { backgroundColor: SettleColors.yellow, borderRadius: 9, borderWidth: 2, borderColor: SettleColors.ink, paddingHorizontal: 11, paddingVertical: 7, transform: [{ rotate: '2deg' }], shadowColor: SettleColors.ink, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0 },
  deckCountText: { color: SettleColors.ink, fontSize: 10, fontFamily: Fonts.display },
  mobileFilters: { gap: 8, paddingBottom: 16 },
  mobileFilter: { borderRadius: 10, borderWidth: 2, borderColor: SettleColors.line, backgroundColor: SettleColors.paper, paddingHorizontal: 14, paddingVertical: 9 },
  mobileFilterActive: { backgroundColor: SettleColors.yellow, borderColor: SettleColors.ink },
  mobileFilterText: { color: SettleColors.muted, fontSize: 11, fontFamily: Fonts.bodyBold },
  mobileFilterTextActive: { color: SettleColors.ink },
  deckStage: { position: 'relative', minHeight: 690, justifyContent: 'flex-start' },
  backCard: { position: 'absolute', top: 12, left: 12, right: 4, height: 650, borderRadius: 16, borderWidth: 3, borderColor: SettleColors.ink, backgroundColor: SettleColors.purple, transform: [{ rotate: '1.3deg' }] },
  swipeHint: { color: SettleColors.ink, textAlign: 'center', fontFamily: Fonts.bodyMedium, fontSize: 11, marginTop: 12 },
  emptyState: { minHeight: 430, borderRadius: 16, borderWidth: 2, borderColor: SettleColors.line, backgroundColor: SettleColors.paper, alignItems: 'center', justifyContent: 'center', padding: 30, shadowColor: SettleColors.ink, shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0 },
  emptyTitle: { color: SettleColors.ink, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  emptyText: { color: SettleColors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 },
  emptyButton: { backgroundColor: SettleColors.emerald, borderRadius: 9, borderWidth: 2, borderColor: SettleColors.ink, paddingHorizontal: 18, paddingVertical: 13, marginTop: 20 },
  emptyButtonText: { color: '#FFFFFF', fontWeight: '800' },
  rightRail: { width: 260, gap: 16, paddingTop: 12 },
  impactCard: { backgroundColor: SettleColors.ink, borderRadius: 14, borderWidth: 3, borderColor: SettleColors.ink, padding: 22, shadowColor: SettleColors.acid, shadowOffset: { width: 7, height: 7 }, shadowOpacity: 1, shadowRadius: 0 },
  impactLabel: { color: '#C8D2CC', fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  impactAmount: { color: '#FFFFFF', fontSize: 38, fontWeight: '800', letterSpacing: -1.2, marginTop: 13 },
  impactCaption: { color: '#B7C0BA', fontSize: 12, lineHeight: 18, marginTop: 4 },
  impactRule: { height: 1, backgroundColor: '#334039', marginVertical: 18 },
  impactRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  impactKey: { color: '#B7C0BA', fontSize: 11 },
  impactValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  promiseCard: { backgroundColor: SettleColors.yellow, borderRadius: 12, borderWidth: 3, borderColor: SettleColors.line, padding: 19, shadowColor: SettleColors.ink, shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0 },
  promiseTitle: { color: SettleColors.ink, fontSize: 15, fontWeight: '800' },
  promiseText: { color: SettleColors.muted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  promiseDivider: { height: 1, backgroundColor: SettleColors.line, marginVertical: 14 },
  promiseFooter: { color: SettleColors.emeraldDark, fontSize: 11, lineHeight: 17, fontWeight: '700' },
  marquee: { width: '100%', marginTop: 46, backgroundColor: SettleColors.ink, borderTopWidth: 3, borderBottomWidth: 3, borderColor: SettleColors.ink, paddingVertical: 16, overflow: 'hidden' },
  marqueeText: { color: SettleColors.acid, textAlign: 'center', fontFamily: Fonts.display, fontSize: 12, letterSpacing: 1.2 },
  receiptOverlay: { flex: 1, backgroundColor: 'rgba(18,24,38,0.55)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  receiptCard: { width: '100%', maxWidth: 440, backgroundColor: SettleColors.paper, borderRadius: 16, borderWidth: 2, borderColor: SettleColors.ink, padding: 28, alignItems: 'center', shadowColor: SettleColors.ink, shadowOffset: { width: 7, height: 7 }, shadowOpacity: 1, shadowRadius: 0 },
  successMotion: { width: 112, height: 112 },
  receiptTitle: { color: SettleColors.ink, fontSize: 25, fontWeight: '800', marginTop: 18 },
  receiptText: { color: SettleColors.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 8 },
  receiptDetail: { width: '100%', borderRadius: 9, borderWidth: 2, borderColor: SettleColors.ink, backgroundColor: SettleColors.soft, padding: 15, marginTop: 20 },
  receiptDetailLabel: { color: SettleColors.muted, fontSize: 10, fontWeight: '800' },
  receiptDetailValue: { color: SettleColors.ink, fontSize: 14, fontWeight: '800', marginTop: 3 },
  chainReceipt: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  chainReceiptKey: { color: SettleColors.muted, fontFamily: Fonts.display, fontSize: 8, letterSpacing: 0.8 },
  chainReceiptValue: { color: SettleColors.purple, fontFamily: Fonts.bodyBold, fontSize: 9 },
  gestureAdded: { color: SettleColors.emerald, fontSize: 11, fontWeight: '700', marginTop: 9 },
  keepButton: { width: '100%', backgroundColor: SettleColors.emerald, borderRadius: 9, borderWidth: 2, borderColor: SettleColors.ink, alignItems: 'center', paddingVertical: 15, marginTop: 18 },
  keepButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
