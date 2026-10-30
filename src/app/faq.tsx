import type { Metadata } from 'expo-router/server';
import { StyleSheet, Text, View } from 'react-native';

import { InfoPage } from '@/components/site/info-page';
import { A, H3, P } from '@/components/site/prose';
import { Fonts, SettleColors } from '@/constants/theme';
import { FAQ, PAGES } from '@/content/site';

export function generateMetadata(): Metadata {
  return { title: PAGES.faq.title, description: PAGES.faq.description };
}

export default function FaqPage() {
  return (
    <InfoPage
      eyebrow="FAQ"
      title="Questions, answered plainly"
      lead="Short answers about what the Settle prototype does and does not do today.">
      <View role="list" style={styles.list}>
        {FAQ.map((item) => (
          <View key={item.q} role="listitem" style={styles.item}>
            <H3>{item.q}</H3>
            <Text style={styles.answer}>{item.a}</Text>
          </View>
        ))}
      </View>
      <P style={styles.more}>
        More detail: <A href="/how-it-works">how it works</A>, <A href="/guidelines">guidelines</A> and the{' '}
        <A href="/privacy">privacy policy</A>.
      </P>
    </InfoPage>
  );
}

const styles = StyleSheet.create({
  list: { gap: 14, marginTop: 36 },
  item: {
    backgroundColor: SettleColors.paper,
    borderColor: SettleColors.ink,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
    padding: 18,
  },
  answer: { color: SettleColors.ink, fontFamily: Fonts.body, fontSize: 16, lineHeight: 26 },
  more: { marginTop: 28 },
});
