# Reduced motion

Settle respects the system setting on every platform: iOS Reduce Motion, Android "remove animations", and the `prefers-reduced-motion` media query on web. `useReducedMotion()` (`src/hooks/use-reduced-motion.ts`) reads it through React Native's `AccessibilityInfo` (which React Native Web maps to the media query) and follows live changes.

## Principle

Motion never carries information alone. When it is reduced, the information it conveyed is still shown by text, state or a still frame.

| Surface | Normal | Reduced | Information preserved by |
|---|---|---|---|
| Swipe to fund / pass | Card slides off (260 ms), springs back, tilts | Card follows the finger without tilt, completes instantly, snaps back without a spring | Fund/Pass stamps still fade in with drag distance; the Pass, Ask and Fund buttons do the same without a gesture |
| Lottie artwork (bill, money) | Looping animation | One still frame, no autoplay or loop | The surrounding card text and amounts |
| Payment success | Animation plays once, modal fades in | Animation rests on its completed final frame, modal appears with no fade | "Payment preview saved" title and the receipt details |
| Onboarding slides | Cross-fade between slides | Instant change | Slide title, copy and progress dots |
| Landing hero float | Looping float | Static | Static layout |
| Reanimated (web splash/icon) | Entering animations | System setting via `ReducedMotionConfig` | Static icon |

## Verify

1. `npx tsc --noEmit && npm run lint && npx expo export --platform web`
2. In a browser, enable "Emulate CSS media feature prefers-reduced-motion: reduce" in DevTools (Rendering tab), reload, and confirm the Lottie art is still, the success animation is on its final frame, and a swipe completes without sliding.
3. On a device, turn on Reduce Motion / remove animations and repeat.

## Not covered

Automated visual tests do not exist in this repository yet; verification above is manual.
