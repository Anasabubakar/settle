/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#18130E',
    background: '#FBF3E2',
    backgroundElement: '#FFF9ED',
    backgroundSelected: '#FFE45C',
    textSecondary: '#6F6256',
  },
  dark: {
    text: '#F8F5EF',
    background: '#121826',
    backgroundElement: '#1D2637',
    backgroundSelected: '#234D42',
    textSecondary: '#B7C0BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    display: 'ArchivoBlack_400Regular',
    body: 'SpaceGrotesk_400Regular',
    bodyMedium: 'SpaceGrotesk_600SemiBold',
    bodyBold: 'SpaceGrotesk_700Bold',
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    display: 'ArchivoBlack_400Regular',
    body: 'SpaceGrotesk_400Regular',
    bodyMedium: 'SpaceGrotesk_600SemiBold',
    bodyBold: 'SpaceGrotesk_700Bold',
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    display: 'ArchivoBlack_400Regular, sans-serif',
    body: 'SpaceGrotesk_400Regular, sans-serif',
    bodyMedium: 'SpaceGrotesk_600SemiBold, sans-serif',
    bodyBold: 'SpaceGrotesk_700Bold, sans-serif',
    sans: 'var(--font-body)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 1440;

export const SettleColors = {
  ink: '#18130E',
  ivory: '#FBF3E2',
  cream: '#FBF3E2',
  paper: '#FFF9ED',
  sage: '#C9F2F0',
  emerald: '#A8E51D',
  emeraldDark: '#506E00',
  mint: '#CBFF36',
  acid: '#CBFF36',
  yellow: '#FFE45C',
  orange: '#FF8A3D',
  pink: '#FF5C93',
  aqua: '#4ED8D0',
  cobalt: '#6C4DF6',
  purple: '#6C4DF6',
  cobaltSoft: '#E7E0FF',
  coral: '#FF5C93',
  line: '#18130E',
  muted: '#6F6256',
  soft: '#F4E8D3',
  lavender: '#E7E0FF',
  blush: '#FFD4E2',
  sky: '#C9F2F0',
} as const;
