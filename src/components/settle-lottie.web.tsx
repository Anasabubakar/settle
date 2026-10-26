import lottie, { type AnimationItem } from 'lottie-web';
import { useEffect, useRef } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';

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
  const containerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const animation: AnimationItem = lottie.loadAnimation({
      animationData: sources[variant],
      autoplay: true,
      container: containerRef.current,
      loop,
      renderer: 'svg',
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
      },
    });

    return () => animation.destroy();
  }, [loop, variant]);

  return (
    <View
      pointerEvents="none"
      ref={(node) => {
        containerRef.current = node as unknown as Element;
      }}
      style={style}
    />
  );
}
