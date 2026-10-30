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

import { ActionButton } from '@/components/ui/primitives';
import { Fonts, SettleColors } from '@/constants/theme';
import type { Bill, KindGesture } from '@/types/domain';

const fontTokens = Fonts as typeof Fonts & { display?: string; body?: string };
const displayFont = fontTokens.display ?? Fonts.sans;
const bodyFont = fontTokens.body ?? Fonts.sans;

export type KindGestureRequest = {
  gesture: KindGesture;
  note: string;
};

export type KindGestureSheetProps = {
  visible: boolean;
  bill: Bill;
  onClose: () => void;
  onSubmit: (request: KindGestureRequest, bill: Bill) => void;
  submitting?: boolean;
};

const gestureCopy: Record<KindGesture, { title: string; description: string; icon: string }> = {
  none: {
    title: 'No gesture, just support',
    description: 'Give freely without asking for anything in return.',
    icon: '♥',
  },
  anonymous_thanks: {
    title: 'A private thank-you',
    description: 'They may send a short note without sharing personal details.',
    icon: '◆',
  },
  progress_update: {
    title: 'An optional update',
    description: 'They may share how settling the bill helped later on.',
    icon: '↗',
  },
  pay_it_forward: {
    title: 'Pay kindness forward someday',
    description: 'A hopeful invitation, with no deadline or obligation.',
    icon: '∞',
  },
  dedication: {
    title: 'A simple dedication',
    description: 'They may dedicate the support to someone meaningful.',
    icon: '◇',
  },
};

export function KindGestureSheet({
  visible,
  bill,
  onClose,
  onSubmit,
  submitting = false,
}: KindGestureSheetProps) {
  const options = useMemo(() => {
    const allowed = new Set(bill.allowedGestures);
    allowed.add('none');
    return (Object.keys(gestureCopy) as KindGesture[]).filter((gesture) => allowed.has(gesture));
  }, [bill.allowedGestures]);
  const [selected, setSelected] = useState<KindGesture>('none');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (visible) {
      setSelected('none');
      setNote('');
    }
  }, [bill.id, visible]);

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
          accessibilityLabel="Close kind gesture panel"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          pointerEvents="box-none"
          style={styles.keyboardView}>
          <View
            accessibilityViewIsModal
            accessibilityLabel={`Ask kindly while supporting ${bill.requester.displayName}`}
            style={styles.sheet}>
            <View style={styles.handle} />
            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.content}>
              <View style={styles.headerRow}>
                <View style={styles.headerCopy}>
                  <Text style={styles.eyebrow}>OPTIONAL KIND GESTURE</Text>
                  <Text style={styles.title}>Ask kindly, never conditionally</Text>
                  <Text style={styles.intro}>
                    Choose something {bill.requester.displayName} may freely accept or decline. Funding never depends on their answer.
                  </Text>
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

              <View accessibilityRole="radiogroup" style={styles.options}>
                {options.map((gesture) => {
                  const copy = gestureCopy[gesture];
                  const isSelected = selected === gesture;
                  return (
                    <Pressable
                      key={gesture}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      onPress={() => setSelected(gesture)}
                      style={({ pressed }) => [
                        styles.option,
                        isSelected && styles.optionSelected,
                        pressed && styles.pressed,
                      ]}>
                      <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
                        <Text style={[styles.optionIconText, isSelected && styles.optionIconTextSelected]}>{copy.icon}</Text>
                      </View>
                      <View style={styles.optionCopy}>
                        <Text style={styles.optionTitle}>{copy.title}</Text>
                        <Text style={styles.optionDescription}>{copy.description}</Text>
                      </View>
                      <View style={[styles.radio, isSelected && styles.radioSelected]}>
                        {isSelected ? <View style={styles.radioDot} /> : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {selected !== 'none' ? (
                <View>
                  <Text style={styles.noteLabel}>Optional note</Text>
                  <TextInput
                    accessibilityLabel="Optional respectful note"
                    multiline
                    maxLength={180}
                    value={note}
                    onChangeText={setNote}
                    placeholder="Keep it warm, brief, and respectful."
                    placeholderTextColor={SettleColors.muted}
                    style={styles.noteInput}
                  />
                  <Text style={styles.characterCount}>{note.length}/180</Text>
                </View>
              ) : null}

              <View style={styles.boundaryCard}>
                <Text style={styles.boundaryIcon}>◉</Text>
                <View style={styles.boundaryCopy}>
                  <Text style={styles.boundaryTitle}>Their dignity comes first</Text>
                  <Text style={styles.boundaryText}>
                    No requests for personal access, romance, sexual content, work, repayment, political support, or publicity.
                  </Text>
                </View>
              </View>

              <ActionButton
                label={selected === 'none' ? 'Continue without a gesture' : 'Add this optional gesture'}
                loading={submitting}
                onPress={() => onSubmit({ gesture: selected, note: note.trim() }, bill)}
              />
              <ActionButton compact label="Not now" tone="secondary" disabled={submitting} onPress={onClose} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(16, 17, 20, 0.64)' },
  keyboardView: { justifyContent: 'flex-end' },
  sheet: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '94%',
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
  content: { padding: 24, paddingTop: 16, gap: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 15 },
  headerCopy: { flex: 1 },
  eyebrow: { color: SettleColors.cobalt, fontFamily: displayFont, fontSize: 10, fontWeight: '400', letterSpacing: 1.3 },
  title: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 29, lineHeight: 32, fontWeight: '400', marginTop: 5, textTransform: 'uppercase' },
  intro: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 14, lineHeight: 20, marginTop: 8 },
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
  options: { gap: 9 },
  option: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 3,
    borderColor: SettleColors.ink,
    borderRadius: 12,
    backgroundColor: SettleColors.paper,
  },
  optionSelected: {
    backgroundColor: SettleColors.mint,
    shadowColor: SettleColors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  optionIcon: { width: 44, height: 44, borderRadius: 10, borderWidth: 2, borderColor: SettleColors.ink, alignItems: 'center', justifyContent: 'center', backgroundColor: SettleColors.soft },
  optionIconSelected: { backgroundColor: SettleColors.paper },
  optionIconText: { color: SettleColors.muted, fontFamily: displayFont, fontSize: 18, fontWeight: '400' },
  optionIconTextSelected: { color: SettleColors.emeraldDark },
  optionCopy: { flex: 1 },
  optionTitle: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 12, fontWeight: '400', textTransform: 'uppercase' },
  optionDescription: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 12, lineHeight: 17, marginTop: 3 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 3, borderColor: SettleColors.ink, alignItems: 'center', justifyContent: 'center', backgroundColor: SettleColors.paper },
  radioSelected: { backgroundColor: SettleColors.cobalt },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: SettleColors.paper },
  noteLabel: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 11, fontWeight: '400', marginBottom: 7, textTransform: 'uppercase' },
  noteInput: { minHeight: 90, textAlignVertical: 'top', color: SettleColors.ink, fontFamily: bodyFont, fontSize: 14, lineHeight: 20, borderWidth: 3, borderColor: SettleColors.ink, borderRadius: 10, padding: 13, backgroundColor: SettleColors.paper },
  characterCount: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 10, textAlign: 'right', marginTop: 5 },
  boundaryCard: { flexDirection: 'row', gap: 11, padding: 14, borderRadius: 10, borderWidth: 3, borderColor: SettleColors.ink, backgroundColor: SettleColors.cobaltSoft },
  boundaryIcon: { color: SettleColors.cobalt, fontFamily: displayFont, fontSize: 16 },
  boundaryCopy: { flex: 1 },
  boundaryTitle: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 12, fontWeight: '400', textTransform: 'uppercase' },
  boundaryText: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 12, lineHeight: 18, marginTop: 3 },
  pressed: { transform: [{ translateX: 2 }, { translateY: 2 }], opacity: 0.86 },
});
