import LottieView from 'lottie-react-native';
import { StyleSheet, type StyleProp, View, type ViewStyle } from 'react-native';

import { STILL_FRAME_PROGRESS, useReducedMotion } from '@/hooks/use-reduced-motion';
import moneyStack from '@/assets/animations/money-stack.json';
import paymentSuccess from '@/assets/animations/payment-success.json';
import settledBill from '@/assets/animations/settled-bill.json';

const sources = {
  bill: settledBill,
  success: paymentSuccess,
  money: moneyStack,
} as const;

type SettleLottieProps = {
  variant: keyof typeof sources;
  loop?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SettleLottie({ variant, loop = true, style }: SettleLottieProps) {
  const reduced = useReducedMotion();

  return (
    <View pointerEvents="none" style={style}>
      <LottieView
        key={reduced ? 'still' : 'moving'}
        autoPlay={!reduced}
        loop={reduced ? false : loop}
        progress={reduced ? STILL_FRAME_PROGRESS[variant] : undefined}
        renderMode="AUTOMATIC"
        source={sources[variant]}
        style={StyleSheet.absoluteFill}
        webStyle={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}
