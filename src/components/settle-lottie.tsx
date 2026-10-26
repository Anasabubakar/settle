import LottieView from 'lottie-react-native';
import { StyleSheet, type StyleProp, View, type ViewStyle } from 'react-native';

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
  return (
    <View pointerEvents="none" style={style}>
      <LottieView
        autoPlay
        loop={loop}
        renderMode="AUTOMATIC"
        source={sources[variant]}
        style={StyleSheet.absoluteFill}
        webStyle={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}
