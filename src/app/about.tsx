import type { Metadata } from 'expo-router/server';

import { InfoPage } from '@/components/site/info-page';
import { A, Bullets, Callout, Facts, P, Section } from '@/components/site/prose';
import { APP_VERSION, PAGES, REPO } from '@/content/site';

export function generateMetadata(): Metadata {
  return { title: PAGES.about.title, description: PAGES.about.description };
}

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About"
      title="What Settle is"
      lead="Settle is an open-source prototype for supporting an essential bill. A requester shares a bill, a supporter funds part or all of it, and the intent is that the money reaches the provider directly.">
      <Callout title="Status">
        Settle {APP_VERSION} is a testnet prototype. It uses sample data, moves no real funds, and has no users, partners or
        volumes to report.
      </Callout>

      <Section title="Why it exists">
        <P>
          Asking for help with rent, power or a clinic bill is awkward, and giving to a stranger&apos;s wallet is hard to
          trust. Settle explores a narrower path: confirm the bill, redact what is private, and send help to the biller
          instead of a person.
        </P>
        <P>
          The part Settle is trying to get right is the layer between a verified bill and a payment: a quote the server
          controls, a wallet that signs exactly that quote, and a receipt that can be checked. It is not meant to be a
          general escrow or crowdfunding product.
        </P>
      </Section>

      <Section title="Who maintains it">
        <P>
          Settle is written and maintained by Anas Abubakar and released under the MIT license. See the{' '}
          <A href={REPO.license}>license</A> for the full terms.
        </P>
      </Section>

      <Section title="Repositories">
        <Facts
          rows={[
            {
              label: 'settle',
              value: (
                <>
                  The Expo app for web, iOS and Android, and these docs. <A href={REPO.app}>github.com/Anasabubakar/settle</A>
                </>
              ),
            },
            {
              label: 'settle-api',
              value: (
                <>
                  The testnet settlement service: quotes, unsigned payments, confirmation and receipts.{' '}
                  <A href={REPO.api}>github.com/Anasabubakar/settle-api</A>
                </>
              ),
            },
          ]}
        />
      </Section>

      <Section title="Contribute and report">
        <Bullets
          items={[
            <>
              Read <A href={REPO.contributing}>CONTRIBUTING.md</A> and the <A href={REPO.conduct}>Code of Conduct</A>, then
              open an <A href={REPO.issues}>issue</A> or a focused pull request.
            </>,
            <>
              Report vulnerabilities privately through the <A href={REPO.security}>security policy</A>, never in a public
              issue.
            </>,
            <>
              Follow what changed in the <A href={REPO.changelog}>changelog</A>.
            </>,
          ]}
        />
      </Section>

      <Section title="Current status">
        <Facts
          rows={[
            { label: 'Web app', status: 'built', value: 'An interactive prototype built with Expo. All data in it is sample data.' },
            { label: 'iOS and Android', status: 'built', value: 'Expo source that runs in Expo Go. There is no store release.' },
            { label: 'Bill files', status: 'built', value: 'Picked on your device and previewed there. They are not uploaded.' },
            { label: 'AI bill review', status: 'simulated', value: 'A scripted product simulation. No model reads your bill.' },
            { label: 'Funding a bill', status: 'simulated', value: 'A testnet preview. No payment is created or signed in the app today.' },
            { label: 'Wallet', status: 'simulated', value: 'Freighter detection on web. Mobile wallet signing is not built.' },
            { label: 'Settlement API', status: 'built', value: 'A separate testnet reference implementation with fixture providers and rates. Not for production.' },
            { label: 'Mainnet', status: 'notBuilt', value: 'Not enabled. It needs the work listed in the readiness guide first.' },
          ]}
        />
        <P>
          The <A href="/how-it-works">flow page</A> explains each step, and the <A href={REPO.readiness}>readiness guide</A>{' '}
          explains what must exist before any live use.
        </P>
      </Section>
    </InfoPage>
  );
}
