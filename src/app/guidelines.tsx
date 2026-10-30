import type { Metadata } from 'expo-router/server';

import { InfoPage } from '@/components/site/info-page';
import { A, Bullets, Callout, Facts, P, Section } from '@/components/site/prose';
import { BILL_CATEGORIES, KIND_GESTURES, PAGES, REPO } from '@/content/site';

export function generateMetadata(): Metadata {
  return { title: PAGES.guidelines.title, description: PAGES.guidelines.description };
}

export default function GuidelinesPage() {
  return (
    <InfoPage
      eyebrow="Guidelines"
      title="Community rules"
      lead="Support is a gift toward a bill. These rules keep it that way. They are the product rules in the repository, and anything not yet decided is marked as undecided.">
      <Callout title="The one rule everything else follows">
        Support is never payment for access, labor, publicity, repayment, romance, sexual content, religion, politics or any
        other personal demand.
      </Callout>

      <Section title="Support has no strings">
        <Bullets
          items={[
            'A requester owes a supporter nothing. A supporter may not ask for anything in return.',
            'Funding may not depend on access, labor, publicity, repayment, romance, sexual content, religion or politics.',
            'Supporters see redacted request details, not a requester\'s private contact information.',
          ]}
        />
      </Section>

      <Section title="Kind Gestures are optional">
        <P>
          A Kind Gesture is a non-transactional acknowledgement a supporter can offer. The requester can decline every one
          of them, and funding never depends on the answer. The options in the app today are:
        </P>
        <Facts rows={KIND_GESTURES.map((gesture) => ({ label: gesture.name, value: gesture.text }))} />
      </Section>

      <Section title="Which bills are eligible">
        <P>The app models requests for essential bills in these categories:</P>
        <Bullets items={[BILL_CATEGORIES.join(', ') + '.']} />
        <P>Settle is designed around these constraints:</P>
        <Bullets
          items={[
            'Help is paid to the bill\'s provider, not to a person\'s wallet. The destination comes from a verified provider directory on the server, never from an uploaded document.',
            'A request needs only enough evidence to confirm a provider, an amount, a due date and a reference. Home address, phone, email, government ID numbers and medical details are removed rather than shown.',
            'A document that is entirely an ID is meant to be rejected.',
            'Partial funding is allowed, so a request can be covered by more than one supporter.',
          ]}
        />
      </Section>

      <Section title="Undecided">
        <P>These questions have no answer yet, and this page will not guess one:</P>
        <Bullets
          items={[
            'Limits on request size, and on how many open requests one person can have.',
            'Which currencies, regions and providers are supported. The sample data uses five currencies and is not a commitment.',
            'What the "other" category may include.',
            'Moderation, reporting inside the app, and appeals.',
            'Disputes, failed payments and refunds.',
            'Age requirements and identity verification beyond what the prototype shows.',
            'Retention periods for evidence. The proposed periods in the privacy design are awaiting legal review.',
            'Whether providers can supply bills directly instead of requesters uploading them.',
          ]}
        />
      </Section>

      <Section title="Reporting a problem">
        <P>
          The prototype has no in-app reporting. For conduct or product concerns, open an issue on{' '}
          <A href={REPO.issues}>GitHub</A> and leave out personal documents and real account numbers. For a vulnerability
          or a document-privacy flaw, do not open a public issue. Follow the <A href={REPO.security}>security policy</A>.
          Contributors and community members are also bound by the <A href={REPO.conduct}>Code of Conduct</A>.
        </P>
      </Section>
    </InfoPage>
  );
}
