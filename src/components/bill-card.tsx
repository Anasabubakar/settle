import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { ActionButton, formatMoney, Pill, ProgressMeter, Surface } from '@/components/ui/primitives';
import { SettleLottie } from '@/components/settle-lottie';
import { Fonts, SettleColors } from '@/constants/theme';
import type { Bill } from '@/types/domain';

const SWIPE_DISTANCE = 96;
const SWIPE_VELOCITY = 0.55;
const fontTokens = Fonts as typeof Fonts & { display?: string; body?: string };
const displayFont = fontTokens.display ?? Fonts.sans;
const bodyFont = fontTokens.body ?? Fonts.sans;

export type BillCardProps = {
  bill: Bill;
  onPass: (bill: Bill) => void;
  onAsk: (bill: Bill) => void;
  onFund: (bill: Bill) => void;
  disabled?: boolean;
};

export function BillCard({ bill, onPass, onAsk, onFund, disabled = false }: BillCardProps) {
  const position = useRef(new Animated.ValueXY()).current;
  const animating = useRef(false);
  const { width } = useWindowDimensions();
  const exitDistance = Math.max(width, 520) * 1.15;
  const exitDistanceRef = useRef(exitDistance);
  exitDistanceRef.current = exitDistance;

  const finishSwipe = (direction: -1 | 1) => {
    if (disabled || animating.current) return;
    animating.current = true;
    Animated.timing(position, {
      toValue: { x: direction * exitDistanceRef.current, y: 8 },
      duration: 260,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        if (direction > 0) onFund(bill);
        else onPass(bill);
      }
      position.setValue({ x: 0, y: 0 });
      animating.current = false;
    });
  };

  const resetCard = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      tension: 72,
      friction: 9,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          !disabled && Math.abs(gesture.dx) > 7 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderMove: (_, gesture) => position.setValue({ x: gesture.dx, y: gesture.dy * 0.12 }),
        onPanResponderRelease: (_, gesture) => {
          const shouldFund = gesture.dx > SWIPE_DISTANCE || gesture.vx > SWIPE_VELOCITY;
          const shouldPass = gesture.dx < -SWIPE_DISTANCE || gesture.vx < -SWIPE_VELOCITY;
          if (shouldFund) finishSwipe(1);
          else if (shouldPass) finishSwipe(-1);
          else resetCard();
        },
        onPanResponderTerminate: resetCard,
        onPanResponderTerminationRequest: () => false,
      }),
    // PanResponder callbacks deliberately read the latest bill handlers through this dependency set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bill, disabled, onFund, onPass, position],
  );

  useEffect(() => {
    position.stopAnimation();
    position.setValue({ x: 0, y: 0 });
    animating.current = false;
  }, [bill.id, position]);

  const total = bill.total.amountMinor / 100;
  const funded = bill.funded.amountMinor / 100;
  const remaining = Math.max(0, total - funded);
  const progress = total > 0 ? funded / total : 0;
  const verificationLabel = bill.aiReview.status === 'passed' ? 'AI + human checks' : 'Review in progress';
  const urgencyTone = bill.urgency === 'urgent' ? 'urgent' : bill.urgency === 'soon' ? 'warm' : 'neutral';

  const cardTransform = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      {
        rotate: position.x.interpolate({
          inputRange: [-240, 0, 240],
          outputRange: ['-4deg', '0deg', '4deg'],
          extrapolate: 'clamp',
        }),
      },
    ],
  };
  const passOpacity = position.x.interpolate({
    inputRange: [-120, -30, 0],
    outputRange: [1, 0.2, 0],
    extrapolate: 'clamp',
  });
  const fundOpacity = position.x.interpolate({
    inputRange: [0, 30, 120],
    outputRange: [0, 0.2, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      accessible
      accessibilityLabel={`${bill.title}. ${formatMoney(remaining, bill.total.currency)} remaining. ${verificationLabel}.`}
      accessibilityHint="Swipe left to pass, swipe right to fund, or use the buttons below."
      accessibilityActions={[
        { name: 'pass', label: 'Pass this bill' },
        { name: 'ask', label: 'Ask a safe question' },
        { name: 'fund', label: 'Fund this bill' },
      ]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'pass') onPass(bill);
        if (event.nativeEvent.actionName === 'ask') onAsk(bill);
        if (event.nativeEvent.actionName === 'fund') onFund(bill);
      }}
      style={[styles.motionShell, cardTransform]}>
      <View pointerEvents="none" style={styles.backplate} />
      <Surface style={styles.card}>
        <View style={[styles.artwork, { backgroundColor: bill.artwork.backgroundColor }]} {...panResponder.panHandlers}>
          <View style={styles.artworkTopRow}>
            <Pill tone={urgencyTone}>{urgencyLabel(bill.urgency, bill.dueDate)}</Pill>
            <Pill tone={bill.aiReview.status === 'passed' ? 'success' : 'neutral'}>{verificationLabel}</Pill>
          </View>
          <SettleLottie style={styles.artworkMotion} variant="bill" />
          <Text style={styles.category}>{bill.category}</Text>

          <Animated.View pointerEvents="none" style={[styles.swipeStamp, styles.passStamp, { opacity: passOpacity }]}>
            <Text style={styles.passStampText}>PASS</Text>
          </Animated.View>
          <Animated.View pointerEvents="none" style={[styles.swipeStamp, styles.fundStamp, { opacity: fundOpacity }]}>
            <Text style={styles.fundStampText}>FUND</Text>
          </Animated.View>
        </View>

        <View style={styles.content}>
          <View style={styles.identityRow}>
            <View style={[styles.avatar, { backgroundColor: bill.requester.avatar.backgroundColor }]}>
              <Text style={[styles.avatarText, { color: bill.requester.avatar.foregroundColor }]}>
                {bill.requester.initials}
              </Text>
            </View>
            <View style={styles.identityCopy}>
              <Text style={styles.memberName}>{bill.requester.displayName}</Text>
              <Text style={styles.memberMeta}>{bill.requester.locationLabel} · {bill.providerDisplayName}</Text>
            </View>
          </View>

          <Text style={styles.title}>{bill.title}</Text>
          <Text numberOfLines={3} style={styles.story}>{bill.story}</Text>

          <View style={styles.amountRow}>
            <View>
              <Text style={styles.eyebrow}>STILL NEEDED</Text>
              <Text style={styles.amount}>{formatMoney(remaining, bill.total.currency)}</Text>
            </View>
            <View style={styles.supporterBlock}>
              <Text style={styles.supporterCount}>{bill.supporterCount}</Text>
              <Text style={styles.supporterLabel}>{bill.supporterCount === 1 ? 'supporter' : 'supporters'}</Text>
            </View>
          </View>
          <ProgressMeter
            value={progress}
            accessibilityLabel={`${Math.round(progress * 100)} percent of this bill funded`}
          />
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>{formatMoney(funded, bill.total.currency)} funded</Text>
            <Text style={styles.progressText}>{formatMoney(total, bill.total.currency)} total</Text>
          </View>

          <View style={styles.actions}>
            <ActionButton compact icon="←" label="Pass" tone="secondary" onPress={() => onPass(bill)} disabled={disabled} />
            <ActionButton compact icon="?" label="Ask" tone="quiet" onPress={() => onAsk(bill)} disabled={disabled} />
            <ActionButton compact icon="♥" label="Fund" onPress={() => onFund(bill)} disabled={disabled} />
          </View>
          <Text style={styles.assurance}>
            {bill.paysProviderDirectly ? 'Payment goes directly to the provider.' : 'Payment is protected until confirmed.'}
          </Text>
        </View>
      </Surface>
    </Animated.View>
  );
}

function urgencyLabel(urgency: Bill['urgency'], dueDate: string) {
  if (urgency === 'urgent') return 'Due very soon';
  if (urgency === 'soon') return 'Due soon';
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) return 'Open request';
  return `Due ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

const styles = StyleSheet.create({
  motionShell: { width: '100%', maxWidth: 520, alignSelf: 'center', position: 'relative', paddingRight: 8, paddingBottom: 8 },
  backplate: {
    position: 'absolute',
    top: 9,
    left: 9,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: SettleColors.ink,
    backgroundColor: SettleColors.purple,
  },
  card: { overflow: 'hidden', shadowOffset: { width: 4, height: 4 } },
  artwork: {
    minHeight: 212,
    padding: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderBottomWidth: 3,
    borderBottomColor: SettleColors.ink,
  },
  artworkTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, zIndex: 2 },
  artworkMotion: {
    position: 'absolute',
    width: 180,
    height: 180,
    left: '50%',
    top: 22,
    marginLeft: -90,
  },
  category: { alignSelf: 'stretch', color: SettleColors.ink, backgroundColor: SettleColors.yellow, borderColor: SettleColors.ink, borderWidth: 2, borderRadius: 9, paddingHorizontal: 13, paddingVertical: 9, fontFamily: displayFont, fontSize: 12, fontWeight: '400', letterSpacing: 1.2, textTransform: 'uppercase' },
  swipeStamp: { position: 'absolute', top: 70, borderWidth: 3, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  passStamp: { right: 26, borderColor: SettleColors.coral, backgroundColor: SettleColors.paper, transform: [{ rotate: '7deg' }] },
  fundStamp: { left: 26, borderColor: SettleColors.emerald, backgroundColor: SettleColors.paper, transform: [{ rotate: '-7deg' }] },
  passStampText: { color: SettleColors.coral, fontFamily: displayFont, fontSize: 25, fontWeight: '400', letterSpacing: 2 },
  fundStampText: { color: SettleColors.emeraldDark, fontFamily: displayFont, fontSize: 25, fontWeight: '400', letterSpacing: 2 },
  content: { padding: 22, gap: 15, backgroundColor: SettleColors.paper },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: SettleColors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SettleColors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  avatarText: { fontFamily: displayFont, fontSize: 13, fontWeight: '400' },
  identityCopy: { flex: 1 },
  memberName: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 13, fontWeight: '400', textTransform: 'uppercase' },
  memberMeta: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 12, marginTop: 2 },
  title: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 30, lineHeight: 33, fontWeight: '400', letterSpacing: -0.7, textTransform: 'uppercase' },
  story: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 15, lineHeight: 22 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 2 },
  eyebrow: { color: SettleColors.muted, fontFamily: displayFont, fontSize: 10, fontWeight: '400', letterSpacing: 1.2 },
  amount: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 31, fontWeight: '400', marginTop: 3 },
  supporterBlock: { alignItems: 'flex-end' },
  supporterCount: { color: SettleColors.purple, fontFamily: displayFont, fontSize: 19, fontWeight: '400' },
  supporterLabel: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 11 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -8 },
  progressText: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 2 },
  assurance: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 11, lineHeight: 16, textAlign: 'center' },
});
