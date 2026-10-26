import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Whether the user has asked the system to reduce motion (iOS Reduce Motion,
 * Android remove animations, and the `prefers-reduced-motion` media query on web).
 * React Native Web maps this onto the media query, so one hook covers every platform.
 * Starts as `false` until the platform answers, then follows live changes.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReduced(value);
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}

/** Duration helper: motion that carries no information collapses to zero. */
export function motionDuration(reduced: boolean, ms: number): number {
  return reduced ? 0 : ms;
}

/**
 * Where a still frame of each animation is drawn when motion is reduced. The success animation
 * rests on its completed state so the outcome it signals is still visible.
 */
export const STILL_FRAME_PROGRESS = { bill: 0.5, money: 0.5, success: 1 } as const;
