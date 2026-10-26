import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ActionButton, formatMoney, Pill, ProgressMeter } from '@/components/ui/primitives';
import { Fonts, SettleColors } from '@/constants/theme';
import { settlementModeLabel } from '@/services/stellar';
import type { Bill, Money } from '@/types/domain';

const fontTokens = Fonts as typeof Fonts & { display?: string; body?: string };
const displayFont = fontTokens.display ?? Fonts.sans;
const bodyFont = fontTokens.body ?? Fonts.sans;

export type ContributionSheetProps = {
  visible: boolean;
  bill: Bill;
  onClose: () => void;
  onConfirm: (amount: Money, bill: Bill) => void;
  submitting?: boolean;
};

export function ContributionSheet({
  visible,
  bill,
  onClose,
  onConfirm,
  submitting = false,
}: ContributionSheetProps) {
  const remainingMinor = Math.max(0, bill.total.amountMinor - bill.funded.amountMinor);
  const suggestedAmounts = useMemo(() => {
    if (!bill.acceptsPartialFunding) return [remainingMinor];
    return Array.from(new Set([
      Math.min(remainingMinor, Math.max(100, Math.round(remainingMinor * 0.25))),
      Math.min(remainingMinor, Math.max(100, Math.round(remainingMinor * 0.5))),
      remainingMinor,
    ])).filter(Boolean);
  }, [bill.acceptsPartialFunding, remainingMinor]);
  const [amountText, setAmountText] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    if (visible) {
      setAmountText(minorToInput(suggestedAmounts[0] ?? remainingMinor));
      setWalletConnected(false);
    }
  }, [bill.id, remainingMinor, suggestedAmounts, visible]);

  const amountMinor = inputToMinor(amountText);
  const invalidAmount = amountMinor <= 0 || amountMinor > remainingMinor;
  const progress = bill.total.amountMinor > 0 ? bill.funded.amountMinor / bill.total.amountMinor : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close contribution panel"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          pointerEvents="box-none"
          style={styles.keyboardView}>
          <View
            accessibilityViewIsModal
            accessibilityLabel={`Contribute to ${bill.title}`}
            style={styles.sheet}>
            <View style={styles.handle} />
            <ScrollView
              bounces={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled">
              <View style={styles.headerRow}>
                <View style={styles.headerCopy}>
                  <Text style={styles.eyebrow}>DIRECT BILL SUPPORT</Text>
                  <Text style={styles.title}>Choose your contribution</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  hitSlop={10}
                  onPress={onClose}
                  style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                  <Text style={styles.closeText}>×</Text>
                </Pressable>
              </View>

              <View style={styles.billSummary}>
                <View style={[styles.billIcon, { backgroundColor: bill.artwork.backgroundColor }]}>
                  <Text style={styles.billIconText}>{bill.category.slice(0, 3).toUpperCase()}</Text>
                </View>
                <View style={styles.billCopy}>
                  <Text numberOfLines={1} style={styles.billTitle}>{bill.title}</Text>
                  <Text style={styles.billMeta}>{bill.providerDisplayName} · {bill.requester.displayName}</Text>
                </View>
                {bill.paysProviderDirectly ? <Pill tone="success">Provider direct</Pill> : null}
              </View>

              <ProgressMeter value={progress} />
              <View style={styles.progressLabels}>
                <Text style={styles.muted}>{formatMoney(bill.funded.amountMinor / 100, bill.total.currency)} funded</Text>
                <Text style={styles.muted}>{formatMoney(remainingMinor / 100, bill.total.currency)} left</Text>
              </View>

              <Text style={styles.sectionLabel}>SELECT AN AMOUNT</Text>
              <View style={styles.amountOptions}>
                {suggestedAmounts.map((minor, index) => {
                  const selected = minor === amountMinor;
                  const label = index === suggestedAmounts.length - 1 ? 'Pay all' : formatMoney(minor / 100, bill.total.currency);
                  return (
                    <Pressable
                      key={minor}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      onPress={() => setAmountText(minorToInput(minor))}
                      style={({ pressed }) => [
                        styles.amountOption,
                        selected && styles.amountOptionSelected,
                        pressed && styles.pressed,
                      ]}>
                      <Text style={[styles.amountOptionText, selected && styles.amountOptionTextSelected]}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {bill.acceptsPartialFunding ? (
                <View>
                  <Text style={styles.inputLabel}>Or enter another amount</Text>
                  <View style={[styles.inputShell, invalidAmount && amountText.length > 0 && styles.inputError]}>
                    <Text style={styles.currency}>{bill.total.currency}</Text>
                    <TextInput
                      accessibilityLabel="Custom contribution amount"
                      inputMode="decimal"
                      keyboardType="decimal-pad"
                      value={amountText}
                      onChangeText={(value) => setAmountText(value.replace(/[^0-9.,]/g, ''))}
                      placeholder="0.00"
                      placeholderTextColor={SettleColors.muted}
                      selectTextOnFocus
                      style={styles.input}
                    />
                  </View>
                  {invalidAmount && amountText.length > 0 ? (
                    <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                      Enter an amount up to {formatMoney(remainingMinor / 100, bill.total.currency)}.
                    </Text>
                  ) : null}
                </View>
              ) : (
                <View style={styles.notice}>
                  <Text style={styles.noticeTitle}>This bill needs one complete payment</Text>
                  <Text style={styles.noticeText}>Partial contributions are not enabled for this request.</Text>
                </View>
              )}

              <View style={styles.protectionRow}>
                <Text style={styles.protectionIcon}>✓</Text>
                <Text style={styles.protectionText}>
                  Your contribution is never payment for access, work, publicity, or a personal relationship.
                </Text>
              </View>

              <View style={styles.stellarPanel}>
                <View style={styles.stellarLogo}><Text style={styles.stellarLogoText}>✦</Text></View>
                <View style={styles.stellarCopy}>
                  <Text style={styles.stellarTitle}>USDC ON STELLAR</Text>
                  <Text style={styles.stellarText}>{walletConnected ? 'Wallet signing preview · no funds move' : 'Your wallet signs. Settle never holds your funds.'}</Text>
                  <Text style={styles.stellarQuote}>A verified server quote is required before any live settlement.</Text>
                </View>
                <View style={styles.networkBadge}><Text style={styles.networkBadgeText}>{settlementModeLabel().toUpperCase()}</Text></View>
              </View>

              {walletConnected ? (
                <ActionButton
                  label={invalidAmount ? 'Choose a valid amount' : `Preview Stellar payment · ${formatMoney(amountMinor / 100, bill.total.currency)}`}
                  disabled={invalidAmount}
                  loading={submitting}
                  onPress={() => onConfirm({ amountMinor, currency: bill.total.currency }, bill)}
                />
              ) : (
                <ActionButton label="Preview Stellar wallet" disabled={false} onPress={() => setWalletConnected(true)} />
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function minorToInput(minor: number) {
  return (minor / 100).toFixed(minor % 100 === 0 ? 0 : 2);
}

function inputToMinor(value: string) {
  const normalized = value.replace(/,/g, '');
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(16, 17, 20, 0.64)' },
  keyboardView: { justifyContent: 'flex-end' },
  sheet: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '92%',
    alignSelf: 'center',
    backgroundColor: SettleColors.paper,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 3,
    borderColor: SettleColors.ink,
    shadowColor: SettleColors.ink,
    shadowOffset: { width: 8, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 16,
  },
  handle: { width: 48, height: 5, borderRadius: 999, backgroundColor: SettleColors.ink, alignSelf: 'center', marginTop: 10 },
  scrollContent: { padding: 24, paddingTop: 16, gap: 17 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  headerCopy: { flex: 1 },
  eyebrow: { color: SettleColors.cobalt, fontFamily: displayFont, fontSize: 10, fontWeight: '400', letterSpacing: 1.3 },
  title: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 29, lineHeight: 32, fontWeight: '400', marginTop: 5, textTransform: 'uppercase' },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: SettleColors.ink,
    backgroundColor: SettleColors.soft,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SettleColors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  closeText: { color: SettleColors.ink, fontFamily: bodyFont, fontSize: 27, lineHeight: 29 },
  billSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 12,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: SettleColors.ink,
    backgroundColor: SettleColors.ivory,
    shadowColor: SettleColors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  billIcon: { width: 46, height: 46, borderRadius: 10, borderWidth: 3, borderColor: SettleColors.ink, alignItems: 'center', justifyContent: 'center' },
  billIconText: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 10, fontWeight: '400', letterSpacing: 0.5 },
  billCopy: { flex: 1, minWidth: 0 },
  billTitle: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 12, fontWeight: '400', textTransform: 'uppercase' },
  billMeta: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 11, marginTop: 3 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -10 },
  muted: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 11, fontWeight: '600' },
  sectionLabel: { color: SettleColors.muted, fontFamily: displayFont, fontSize: 10, fontWeight: '400', letterSpacing: 1.3 },
  amountOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  amountOption: {
    flexGrow: 1,
    minWidth: 100,
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: SettleColors.ink,
    backgroundColor: SettleColors.paper,
    shadowColor: SettleColors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  amountOptionSelected: { backgroundColor: SettleColors.cobalt },
  amountOptionText: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 12, fontWeight: '400', textTransform: 'uppercase' },
  amountOptionTextSelected: { color: SettleColors.paper },
  inputLabel: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 11, fontWeight: '400', marginBottom: 8, textTransform: 'uppercase' },
  inputShell: { minHeight: 57, flexDirection: 'row', alignItems: 'center', borderWidth: 3, borderColor: SettleColors.ink, borderRadius: 10, paddingHorizontal: 15, backgroundColor: SettleColors.paper },
  inputError: { borderColor: SettleColors.coral },
  currency: { color: SettleColors.muted, fontFamily: displayFont, fontSize: 12, fontWeight: '400', marginRight: 10 },
  input: { flex: 1, color: SettleColors.ink, fontFamily: displayFont, fontSize: 21, fontWeight: '400', paddingVertical: 12 },
  errorText: { color: SettleColors.coral, fontFamily: bodyFont, fontSize: 12, marginTop: 6 },
  notice: { borderRadius: 10, borderWidth: 3, borderColor: SettleColors.ink, backgroundColor: SettleColors.cobaltSoft, padding: 14 },
  noticeTitle: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 12, fontWeight: '400', textTransform: 'uppercase' },
  noticeText: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 12, lineHeight: 18, marginTop: 3 },
  protectionRow: { flexDirection: 'row', gap: 10, padding: 13, borderRadius: 10, borderWidth: 3, borderColor: SettleColors.ink, backgroundColor: SettleColors.mint },
  protectionIcon: { color: SettleColors.emeraldDark, fontFamily: displayFont, fontSize: 15, fontWeight: '400' },
  protectionText: { flex: 1, color: SettleColors.ink, fontFamily: bodyFont, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  stellarPanel: { alignItems: 'center', backgroundColor: SettleColors.ink, borderColor: SettleColors.ink, borderRadius: 11, borderWidth: 3, flexDirection: 'row', gap: 12, padding: 14, shadowColor: SettleColors.acid, shadowOffset: { height: 4, width: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  stellarLogo: { alignItems: 'center', backgroundColor: SettleColors.purple, borderColor: SettleColors.paper, borderRadius: 8, borderWidth: 2, height: 42, justifyContent: 'center', width: 42 },
  stellarLogoText: { color: SettleColors.acid, fontFamily: displayFont, fontSize: 18 },
  stellarCopy: { flex: 1 },
  stellarTitle: { color: SettleColors.paper, fontFamily: displayFont, fontSize: 11 },
  stellarText: { color: SettleColors.lavender, fontFamily: bodyFont, fontSize: 10, marginTop: 3 },
  stellarQuote: { color: SettleColors.orange, fontFamily: bodyFont, fontSize: 9, marginTop: 3 },
  networkBadge: { backgroundColor: SettleColors.acid, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 6 },
  networkBadgeText: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 7 },
  pressed: { transform: [{ translateX: 2 }, { translateY: 2 }], opacity: 0.86 },
});
