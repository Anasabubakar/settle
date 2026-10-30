import type { Metadata } from 'expo-router/server';
import { StyleSheet, Text, View } from 'react-native';

import { InfoPage } from '@/components/site/info-page';
import { A, Bullets, Callout, H3, P, Section, StatusBadge } from '@/components/site/prose';
import { Fonts, SettleColors } from '@/constants/theme';
import { FLOW_STEPS, NOT_BUILT, PAGES, REPO, STATUS_MEANING, type StepStatus } from '@/content/site';

export function generateMetadata(): Metadata {
  return { title: PAGES.howItWorks.title, description: PAGES.howItWorks.description };
}

const KEY: StepStatus[] = ['built', 'simulated', 'notBuilt'];

export default function HowItWorksPage() {
  return (
    <InfoPage
      eyebrow="How it works"
      title="From a bill to a receipt, and what is real today"
      lead="Settle is meant to let a supporter fund part or all of a bill, paid straight to the provider on Stellar. This page walks the whole flow and says plainly which steps exist.">
      <Callout title="Testnet prototype">
        No real funds move. The app uses sample data, and mainnet is not enabled. The status labels below describe what you
        experience in the app at this version.
      </Callout>

      <Section title="How to read the labels">
        <View role="list" style={styles.key}>
          {KEY.map((status) => (
            <View key={status} role="listitem" style={styles.keyRow}>
              <StatusBadge status={status} />
              <Text style={styles.keyText}>{STATUS_MEANING[status]}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="The flow, step by step">
        <View role="list" style={styles.steps}>
          {FLOW_STEPS.map((step, index) => (
            <View key={step.title} role="listitem" style={styles.step}>
              <View style={styles.stepHead}>
                <View style={styles.number}>
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepTitle}>
                  <H3>{step.title}</H3>
                </View>
              </View>
              <StatusBadge status={step.status} />
              <View style={styles.detail}>
                <Text style={styles.detailLabel}>In the app</Text>
                <P>{step.inApp}</P>
              </View>
              <View style={styles.detail}>
                <Text style={styles.detailLabel}>In the repositories</Text>
                <P>{step.inRepos}</P>
              </View>
            </View>
          ))}
        </View>
      </Section>

      <Section title="What stays out of the app by design">
        <Bullets
          items={[
            'The app never holds a signing key and never builds a transaction.',
            'The app does not choose the destination, the asset issuer, the exchange rate or the fee. The settlement API decides them.',
            'A payment is not called settled until the network confirms it independently.',
          ]}
        />
        <P>
          The settlement API is a separate project, <A href={REPO.api}>settle-api</A>, with an{' '}
          <A href={REPO.apiContract}>API contract</A> and a <A href={REPO.apiThreatModel}>threat model</A>. The{' '}
          <A href={REPO.readiness}>readiness guide</A> lists what must exist before any mainnet decision.
        </P>
      </Section>

      <Section title="Not built yet">
        <Bullets items={[...NOT_BUILT]} />
        <P>
          Questions about any of this are answered on the <A href="/faq">FAQ</A>. The rules for requesters and
          supporters are on the <A href="/guidelines">Guidelines</A> page.
        </P>
      </Section>
    </InfoPage>
  );
}

const styles = StyleSheet.create({
  key: { gap: 12 },
  keyRow: { alignItems: 'flex-start', gap: 8 },
  keyText: { color: SettleColors.ink, fontFamily: Fonts.body, fontSize: 16, lineHeight: 24 },
  steps: { gap: 18 },
  step: {
    backgroundColor: SettleColors.paper,
    borderColor: SettleColors.ink,
    borderRadius: 12,
    borderWidth: 3,
    gap: 12,
    padding: 18,
  },
  stepHead: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  stepTitle: { flex: 1, minWidth: 0 },
  number: {
    alignItems: 'center',
    backgroundColor: SettleColors.cobalt,
    borderColor: SettleColors.ink,
    borderRadius: 10,
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  numberText: { color: '#FFFFFF', fontFamily: Fonts.display, fontSize: 14 },
  detail: { gap: 4 },
  detailLabel: { color: SettleColors.muted, fontFamily: Fonts.bodyBold, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase' },
});
