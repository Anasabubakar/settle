import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import { Fonts, SettleColors } from '@/constants/theme';

const fontTokens = Fonts as typeof Fonts & { display?: string; body?: string };
const displayFont = fontTokens.display ?? Fonts.sans;
const bodyFont = fontTokens.body ?? Fonts.sans;

export function formatMoney(amount: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
  }
}

export function Surface({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.surface, style]}>{children}</View>;
}

export function Pill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warm' | 'urgent';
}) {
  return (
    <View style={[styles.pill, pillTones[tone].background]}>
      <Text style={[styles.pillLabel, pillTones[tone].text]}>{children}</Text>
    </View>
  );
}

type ActionButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  icon?: string;
  tone?: 'primary' | 'secondary' | 'quiet' | 'danger';
  compact?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ActionButton({
  label,
  icon,
  tone = 'primary',
  compact = false,
  loading = false,
  disabled,
  style,
  ...props
}: ActionButtonProps) {
  const blocked = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={blocked}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        buttonTones[tone].container,
        blocked && styles.buttonDisabled,
        pressed && !blocked && styles.buttonPressed,
        style,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={buttonTones[tone].label.color} />
      ) : (
        <>
          {icon ? <Text style={[styles.buttonIcon, buttonTones[tone].label]}>{icon}</Text> : null}
          <Text style={[styles.buttonLabel, buttonTones[tone].label]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export function ProgressMeter({
  value,
  accessibilityLabel = 'Funding progress',
}: {
  value: number;
  accessibilityLabel?: string;
}) {
  const normalized = Math.max(0, Math.min(1, value));
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(normalized * 100) }}
      style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${normalized * 100}%` }]} />
    </View>
  );
}

const pillTones = {
  neutral: { background: { backgroundColor: SettleColors.soft }, text: { color: SettleColors.ink } },
  success: {
    background: { backgroundColor: SettleColors.mint },
    text: { color: SettleColors.emeraldDark },
  },
  warm: { background: { backgroundColor: SettleColors.yellow }, text: { color: SettleColors.ink } },
  urgent: {
    background: { backgroundColor: SettleColors.blush },
    text: { color: SettleColors.ink },
  },
} as const;

const buttonContainers = StyleSheet.create({
  primary: { backgroundColor: SettleColors.purple, borderColor: SettleColors.ink },
  secondary: { backgroundColor: SettleColors.paper, borderColor: SettleColors.ink },
  quiet: { backgroundColor: SettleColors.acid, borderColor: SettleColors.ink },
  danger: { backgroundColor: SettleColors.soft, borderColor: SettleColors.ink },
});

const buttonLabels = StyleSheet.create({
  primary: { color: SettleColors.paper },
  secondary: { color: SettleColors.ink },
  quiet: { color: SettleColors.ink },
  danger: { color: SettleColors.coral },
});

const buttonTones = {
  primary: { container: buttonContainers.primary, label: buttonLabels.primary },
  secondary: { container: buttonContainers.secondary, label: buttonLabels.secondary },
  quiet: { container: buttonContainers.quiet, label: buttonLabels.quiet },
  danger: { container: buttonContainers.danger, label: buttonLabels.danger },
};

const styles = StyleSheet.create({
  surface: {
    backgroundColor: SettleColors.paper,
    borderColor: SettleColors.ink,
    borderRadius: 12,
    borderWidth: 3,
    shadowColor: SettleColors.ink,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  pill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: SettleColors.ink,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  pillLabel: {
    fontFamily: displayFont,
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  button: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 3,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: SettleColors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  buttonCompact: {
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  buttonDisabled: { opacity: 0.48 },
  buttonPressed: {
    transform: [{ translateX: 4 }, { translateY: 4 }],
    shadowOffset: { width: 0, height: 0 },
  },
  buttonLabel: {
    fontFamily: displayFont,
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.45,
    textTransform: 'uppercase',
  },
  buttonIcon: { fontFamily: bodyFont, fontSize: 17, fontWeight: '800' },
  progressTrack: {
    height: 13,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: SettleColors.ink,
    overflow: 'hidden',
    backgroundColor: SettleColors.soft,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: SettleColors.acid,
  },
});
