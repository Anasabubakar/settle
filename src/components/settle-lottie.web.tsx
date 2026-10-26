import lottie, { type AnimationItem } from 'lottie-web';
import { useEffect, useRef } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';

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
  const containerRef = useRef<Element | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!containerRef.current) return;

    const animation: AnimationItem = lottie.loadAnimation({
      animationData: sources[variant],
      autoplay: !reduced,
      container: containerRef.current,
      loop: reduced ? false : loop,
      renderer: 'svg',
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
      },
    });

    if (reduced) {
      // Draw one still frame instead of playing; success rests on its completed state.
      animation.addEventListener('DOMLoaded', () => {
        animation.goToAndStop(Math.floor(animation.totalFrames * STILL_FRAME_PROGRESS[variant]), true);
      });
    }

    return () => animation.destroy();
  }, [loop, reduced, variant]);

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
