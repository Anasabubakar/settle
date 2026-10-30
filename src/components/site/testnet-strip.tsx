import { StyleSheet, Text, View } from 'react-native';

import { Fonts, SettleColors } from '@/constants/theme';
import { APP_VERSION } from '@/content/site';

/** Always-visible status line so the prototype is never mistaken for a live service. */
export function TestnetStrip() {
  return (
    <View role="note" style={styles.strip}>
      <Text style={styles.text}>Testnet prototype v{APP_VERSION} · sample data · no real funds move</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: { alignItems: 'center', backgroundColor: SettleColors.ink, paddingHorizontal: 12, paddingVertical: 6 },
  text: { color: SettleColors.yellow, fontFamily: Fonts.bodyBold, fontSize: 12, lineHeight: 17, textAlign: 'center' },
});
