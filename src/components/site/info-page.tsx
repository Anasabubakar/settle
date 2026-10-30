import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SiteFooter } from '@/components/site/site-footer';
import { Fonts, SettleColors } from '@/constants/theme';

type Props = {
  eyebrow: string;
  title: string;
  lead: string;
  updated?: string;
  children: ReactNode;
};

/** Shared layout for the informational pages: one h1, readable measure, footer at the end. */
export function InfoPage({ eyebrow, title, lead, updated, children }: Props) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.wrap}>
          {Platform.OS !== 'web' ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/profile'))}
              style={styles.back}>
              <Text style={styles.backText}>{'←'} Back</Text>
            </Pressable>
          ) : null}
          <View style={styles.eyebrow}>
            <Text style={styles.eyebrowText}>{eyebrow}</Text>
          </View>
          <Text role="heading" aria-level={1} style={styles.title}>
            {title}
          </Text>
          <Text style={styles.lead}>{lead}</Text>
          {updated ? <Text style={styles.updated}>Last updated {updated}</Text> : null}
          <View style={styles.body}>{children}</View>
        </View>
        <SiteFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1, paddingTop: 36 },
  wrap: { alignSelf: 'center', maxWidth: 780, paddingHorizontal: 16, width: '100%' },
  back: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', marginBottom: 8 },
  backText: { color: SettleColors.cobalt, fontFamily: Fonts.bodyBold, fontSize: 16 },
  eyebrow: {
    alignSelf: 'flex-start',
    backgroundColor: SettleColors.yellow,
    borderColor: SettleColors.ink,
    borderRadius: 7,
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  eyebrowText: { color: SettleColors.ink, fontFamily: Fonts.display, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  title: {
    color: SettleColors.ink,
    fontFamily: Fonts.display,
    fontSize: 34,
    letterSpacing: -0.8,
    lineHeight: 40,
    marginTop: 16,
  },
  lead: { color: SettleColors.ink, fontFamily: Fonts.body, fontSize: 18, lineHeight: 28, marginTop: 14 },
  updated: { color: SettleColors.muted, fontFamily: Fonts.bodyMedium, fontSize: 14, marginTop: 12 },
  body: { marginTop: 4 },
});
