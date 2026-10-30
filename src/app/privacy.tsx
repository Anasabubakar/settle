import type { Metadata } from 'expo-router/server';

import { InfoPage } from '@/components/site/info-page';
import { A, Bullets, Callout, P, Section } from '@/components/site/prose';
import { LAST_UPDATED, PAGES, REPO } from '@/content/site';

export function generateMetadata(): Metadata {
  return { title: PAGES.privacy.title, description: PAGES.privacy.description };
}

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Privacy policy"
      lead="This describes what the Settle prototype actually does with information at this version. It is written from the code, not from a plan."
      updated={LAST_UPDATED}>
      <Callout title="In short">
        No accounts, no analytics, no cookies set by the app, no ads, and no uploads of your bill files. Settle is a testnet
        prototype with sample data.
      </Callout>

      <Section title="What stays on your device">
        <Bullets
          items={[
            'Bill photos and PDFs. When you pick one, the app previews it on your device. The app has no code that uploads it.',
            'What you type while posting a bill, such as the amount, provider and story. It is held in memory while the page is open and is gone when you reload or close it. It is not sent anywhere.',
            'One stored value. After the intro screens, the app saves a single key, settle:onboarding-complete, set to true, so it does not show them again. It uses AsyncStorage, which is your browser\'s local storage on web and app storage on iOS and Android. Clear site data or app data to remove it.',
          ]}
        />
        <P>The app code stores nothing else. Your browser may keep its normal cache of the site&apos;s files.</P>
      </Section>

      <Section title="Network requests the app makes">
        <Bullets
          items={[
            'Loading the app. Your browser requests the site\'s own files from whichever host serves it: pages, scripts, fonts, animations and images. Fonts and animations are bundled with the app and are not fetched from a third-party font service.',
            'Your wallet, on web only. The app talks to the Freighter browser extension on your device to see whether it is available. If you press connect, the extension asks you, and the app then reads your public address and which Stellar network the wallet is on. A public address is not a secret. In the public demo, no payment is signed; in a build connected to the testnet settlement API, you can sign a testnet payment.',
            'The settlement API, only if a build is configured with one. The default build is not. When one is configured, a funding request sends the bill id, the amount in minor units, the currency, your wallet\'s public address and a random idempotency key, and later the signed transaction. It never sends your bill file. The request goes to the address that build was configured with.',
          ]}
        />
        <P>
          The app contains settings for Stellar testnet endpoints (Horizon and RPC) and a link format for a public block
          explorer, but it does not call those endpoints today. Links you press, such as GitHub or Freighter, take you to
          other sites with their own policies.
        </P>
      </Section>

      <Section title="Hosting">
        <P>
          When the web build is deployed on Vercel, Vercel serves the files and, like any web host, handles connection data
          such as your IP address and browser details in its logs. Settle adds no tracking on top of that. See{' '}
          <A href="https://vercel.com/legal/privacy-policy">Vercel&apos;s privacy policy</A> for how it treats that data.
        </P>
      </Section>

      <Section title="What Settle does not do">
        <Bullets
          items={[
            'No analytics, advertising, session recording or tracking scripts.',
            'No cookies set by the app.',
            'No accounts, so there is no profile data to delete on a server.',
            'No selling or sharing of personal data. The app does not collect any.',
            'No use of your files to train models. Files are not uploaded.',
          ]}
        />
      </Section>

      <Section title="The planned evidence design">
        <P>
          If Settle ever accepts bill evidence, it is designed to collect the least that proves a bill, redact before
          anything else sees it, show supporters only redacted fields, and delete on a schedule. That design, including
          proposed retention periods that still need legal review, is in{' '}
          <A href={REPO.privacyEvidence}>docs/privacy-evidence.md</A>. It is partly implemented in the separate settle-api
          repository. The app does not upload bills, so it does not apply to this app today. This policy will be updated before
          that changes.
        </P>
      </Section>

      <Section title="Contact and changes">
        <P>
          For privacy questions, open an issue on <A href={REPO.issues}>GitHub</A>, and do not post personal documents or
          real account numbers there. To report a vulnerability or a document-privacy flaw privately, follow the{' '}
          <A href={REPO.security}>security policy</A>. Settle does not publish a contact email for this prototype.
        </P>
        <P>
          Changes to this policy appear in the <A href={REPO.changelog}>changelog</A>. The date above is the last update.
        </P>
      </Section>
    </InfoPage>
  );
}
