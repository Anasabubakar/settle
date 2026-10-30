import type { Metadata } from 'expo-router/server';

import { InfoPage } from '@/components/site/info-page';
import { A, Bullets, Callout, P, Section } from '@/components/site/prose';
import { LAST_UPDATED, PAGES, REPO } from '@/content/site';

export function generateMetadata(): Metadata {
  return { title: PAGES.terms.title, description: PAGES.terms.description };
}

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms of use"
      lead="Plain-language terms for using the Settle prototype. Using the app means you accept them."
      updated={LAST_UPDATED}>
      <Callout title="In short">
        Settle is a testnet prototype with sample data. Nothing in it has real monetary value, and nothing in it is advice.
      </Callout>

      <Section title="A testnet prototype">
        <P>
          Settle runs on the Stellar test network, whose tokens have no value. The bills, people, balances and activity you
          see are sample data. Funding a bill is a preview that moves no funds. Mainnet is not enabled. Do not treat anything
          in the app as a real request, a real payment or a real receipt.
        </P>
      </Section>

      <Section title="Software provided as is">
        <P>
          Settle&apos;s code is released under the MIT license, which provides the software as is, without warranty of any
          kind. Read the <A href={REPO.license}>license</A> for the exact wording. The prototype may be wrong, incomplete,
          unavailable or changed at any time.
        </P>
      </Section>

      <Section title="Not advice, not a financial service">
        <Bullets
          items={[
            'Nothing here is financial, investment, legal or tax advice.',
            'Settle is not a bank, a money transmitter or a payment processor. It holds no funds and moves none.',
            'If Settle ever handled real value, that would require legal and compliance review for each place it operates. That has not happened.',
          ]}
        />
      </Section>

      <Section title="No guarantee of funding or outcomes">
        <P>
          Posting a bill does not mean it will be funded. Funding a bill does not mean a provider will accept or apply it.
          Settle makes no promise about amounts, timing, verification results or what happens to any bill.
        </P>
      </Section>

      <Section title="Community rules">
        <P>
          Use of Settle is subject to the <A href="/guidelines">community guidelines</A>. In particular, support is never
          payment for access, labor, publicity or relationships, and Kind Gestures are optional and can be declined. Do not
          use the app to harass, deceive or pressure anyone.
        </P>
      </Section>

      <Section title="Third-party services">
        <P>
          Stellar, the Freighter wallet and any host that serves the app are separate services with their own terms. Settle
          is not responsible for them.
        </P>
      </Section>

      <Section title="Governing law and disputes">
        <P>This is undecided. The prototype has no operating entity or jurisdiction yet.</P>
      </Section>

      <Section title="Contact and changes">
        <P>
          Questions or concerns: open an issue on <A href={REPO.issues}>GitHub</A>. Security matters go through the{' '}
          <A href={REPO.security}>security policy</A>. These terms may change, and the date above shows the last update.
          See also the <A href="/privacy">privacy policy</A>.
        </P>
      </Section>
    </InfoPage>
  );
}
