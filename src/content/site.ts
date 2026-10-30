import { version } from '../../package.json';

export const APP_VERSION: string = version;
export const LAST_UPDATED = '30 October 2026';

export const REPO = {
  app: 'https://github.com/Anasabubakar/settle',
  api: 'https://github.com/Anasabubakar/settle-api',
  issues: 'https://github.com/Anasabubakar/settle/issues',
  contributing: 'https://github.com/Anasabubakar/settle/blob/main/CONTRIBUTING.md',
  security: 'https://github.com/Anasabubakar/settle/blob/main/SECURITY.md',
  conduct: 'https://github.com/Anasabubakar/settle/blob/main/CODE_OF_CONDUCT.md',
  license: 'https://github.com/Anasabubakar/settle/blob/main/LICENSE',
  readiness: 'https://github.com/Anasabubakar/settle/blob/main/docs/stellar-readiness.md',
  privacyEvidence: 'https://github.com/Anasabubakar/settle/blob/main/docs/privacy-evidence.md',
  changelog: 'https://github.com/Anasabubakar/settle/blob/main/CHANGELOG.md',
  apiContract: 'https://github.com/Anasabubakar/settle-api/blob/main/openapi.yaml',
  apiThreatModel: 'https://github.com/Anasabubakar/settle-api/blob/main/docs/threat-model.md',
} as const;

export type PageMeta = { title: string; description: string };

export const PAGES = {
  home: {
    title: 'Settle | Fund a bill directly (testnet prototype)',
    description:
      'Settle is an open-source testnet prototype for supporting an essential bill, paid provider-direct on Stellar. Sample data only, no real funds move.',
  },
  discover: {
    title: 'Discover sample bills | Settle',
    description:
      'Swipe through sample bill requests and preview a testnet payment. The bills and people are sample data and no real funds move.',
  },
  activity: {
    title: 'Impact (sample data) | Settle',
    description: 'A sample activity and impact view for the Settle prototype. Every entry is sample data.',
  },
  post: {
    title: 'Post a bill | Settle',
    description:
      'Try the bill posting flow: pick a file or use a demo bill, review a simulated extraction and preview a request. Files stay on your device.',
  },
  profile: {
    title: 'Profile (sample) | Settle',
    description: 'A sample profile and preferences screen for the Settle prototype, with links to guidelines, privacy and terms.',
  },
  onboarding: {
    title: 'Welcome | Settle',
    description: 'A short introduction to the Settle testnet prototype.',
  },
  howItWorks: {
    title: 'How it works | Settle',
    description:
      'The Settle flow from bill to receipt, with an honest label on each step: built, simulated or not built yet. Testnet prototype, no real funds.',
  },
  guidelines: {
    title: 'Community guidelines | Settle',
    description:
      'Settle community rules: support is never payment for access, labor, publicity or relationships, and Kind Gestures are optional and declinable.',
  },
  about: {
    title: 'About | Settle',
    description:
      'What Settle is, why it exists, who maintains it, where the code lives and what its current status is. MIT licensed testnet prototype.',
  },
  faq: {
    title: 'FAQ | Settle',
    description:
      'Plain answers about Settle: whether real money moves, where bill files go, what testnet means, who gets paid and how to contribute.',
  },
  privacy: {
    title: 'Privacy policy | Settle',
    description:
      'What the Settle prototype keeps on your device, which network requests it makes, and what it does not do. Last updated 30 October 2026.',
  },
  terms: {
    title: 'Terms of use | Settle',
    description:
      'Plain-language terms for the Settle testnet prototype: no real value, MIT software as is, not financial, legal or tax advice. Last updated 30 October 2026.',
  },
} as const satisfies Record<string, PageMeta>;

export type StepStatus = 'built' | 'simulated' | 'notBuilt';

export const STATUS_LABEL: Record<StepStatus, string> = {
  built: 'Built',
  simulated: 'Simulated',
  notBuilt: 'Not built',
};

export const STATUS_MEANING: Record<StepStatus, string> = {
  built: 'The code exists and does what the step says.',
  simulated: 'The app shows this step with sample data. Nothing real happens.',
  notBuilt: 'Planned or required before any live use. It does not exist yet.',
};

export type FlowStep = {
  title: string;
  status: StepStatus;
  inApp: string;
  inRepos: string;
};

/** Statuses describe what a person using the app experiences at this version. */
export const FLOW_STEPS: FlowStep[] = [
  {
    title: 'A requester chooses a bill',
    status: 'built',
    inApp:
      'The requester picks a photo or PDF with the system picker, or tries a built-in demo bill. The file is previewed on the device. It is not uploaded anywhere.',
    inRepos:
      'Nothing in the app sends the picked file over the network. An evidence service exists separately in settle-api, but the app does not call it.',
  },
  {
    title: 'Review and redaction',
    status: 'simulated',
    inApp:
      'A timer runs a scripted review and shows sample extracted fields (provider, amount, due date, account) with redaction toggles. No model reads your file.',
    inRepos:
      'settle-api has encrypted local quarantine, a restricted manual review step, an allowlisted redacted summary, an audit log and retention purge. Automated redaction, malware scanning, individual reviewer authorization and authenticated client upload are not built.',
  },
  {
    title: 'A supporter chooses how much to fund',
    status: 'simulated',
    inApp:
      'A supporter swipes through sample bills and picks a custom, partial or full amount, with an optional Kind Gesture. The bills and people are sample data, and choosing an amount creates no payment.',
    inRepos: 'There is no real bill or provider directory behind the sample bills.',
  },
  {
    title: 'Quote with an unsigned payment',
    status: 'simulated',
    inApp:
      'The public demo build shows a simulated preview and requests no quote. A build configured with a settlement API URL asks the API for a quote and shows the amount, the fixture exchange rate, the network fee and the expiry before you sign.',
    inRepos:
      'settle-api is a separate repository and a testnet reference implementation: it returns an expiring, fee-disclosed quote and an unsigned transaction from fixture providers and fixture rates. It has no authentication, no real provider directory and no real rate source. The app has a client for it that only runs when a settlement API URL is configured at build time.',
  },
  {
    title: 'The wallet signs',
    status: 'simulated',
    inApp:
      'In the public demo build nothing is signed. In a build configured with a settlement API URL, desktop web asks the Freighter extension to sign the exact transaction the API built, and the app refuses a transaction that differs. On iOS and Android the wallet is reported as unavailable.',
    inRepos:
      'A wallet adapter exists for Freighter on web. It is designed to sign only the exact transaction the settlement API produced. Mobile wallet signing is not built.',
  },
  {
    title: 'The network confirms',
    status: 'simulated',
    inApp: 'In the public demo build there is no payment to watch. In a configured testnet build the app asks the settlement API to confirm, and shows success only when the API has re-read the transaction from the network and matched it to the quote.',
    inRepos:
      'The settle-api reference re-reads a submitted testnet transaction from the network and compares it to the quote before treating it as confirmed. A production confirmation observer and indexer are not built.',
  },
  {
    title: 'A receipt',
    status: 'simulated',
    inApp:
      'In the public demo build, a preview ends with a "payment preview saved" screen that has no transaction behind it. In a configured testnet build the app shows the receipt id, a Stellar Expert testnet link and the receipt JSON.',
    inRepos:
      'The settle-api reference keeps an append-only, hash-chained receipt ledger on testnet. Provider reconciliation and a production receipt indexer are not built.',
  },
];

export const NOT_BUILT = [
  'Mainnet settlement. Mainnet is not enabled in any build of Settle.',
  'A real provider directory and a real exchange-rate source.',
  'Authentication for the settlement API.',
  'Mobile wallet signing on iOS and Android.',
  'A production confirmation observer, receipt indexer and provider reconciliation.',
  'Automated redaction, malware scanning and authenticated bill upload.',
  'Fraud controls, disputes and refunds, monitoring and an incident runbook.',
  'Legal and compliance review for any operating jurisdiction.',
] as const;

export type FaqItem = { q: string; a: string };

export const FAQ: FaqItem[] = [
  {
    q: 'Does Settle move real money?',
    a: 'No. Settle is a testnet prototype. In the public demo, funding a bill is a preview: no payment is made, nothing is signed, and no funds move. In a build connected to the testnet settlement API, a supporter can sign a real testnet payment, which has no monetary value. Stellar mainnet is not enabled.',
  },
  {
    q: 'Where do my bill files go?',
    a: 'Nowhere. When you choose a photo or PDF, the app shows a preview on your device. The file is not uploaded. The app has no code path that sends a picked file to a server. Reloading the page clears what you entered.',
  },
  {
    q: 'What is testnet?',
    a: 'Testnet is Stellar\'s public test network. Its tokens are free and have no monetary value, and it exists so developers can try payments without risk to real funds. Settle defaults to testnet and labels itself that way.',
  },
  {
    q: 'Who gets paid?',
    a: 'The design pays the bill\'s provider directly, not a personal wallet. The destination is meant to come from a verified provider directory on the server, never from the app or from an uploaded document. Today nobody is paid, because no real payment is made.',
  },
  {
    q: 'What does the AI bill review do today?',
    a: 'It is a product simulation. The review screen plays a scripted scan and shows sample fields. No AI model reads your bill. A real review would need private backend processing and redaction that do not exist yet.',
  },
  {
    q: 'Do I need a crypto wallet?',
    a: 'Not to look around. On desktop web, the app can detect the Freighter browser extension. In the public demo it does not ask Freighter to sign anything; in a build connected to the testnet settlement API it asks Freighter to sign a testnet payment. On iOS and Android, wallet signing is not available.',
  },
  {
    q: 'Are the bills, people and amounts real?',
    a: 'No. Every bill, name, location, balance and activity entry in the app is sample data written for the prototype. Nothing on the Discover, Impact or Profile screens reflects a real person or a real payment.',
  },
  {
    q: 'Do I have to send or accept a Kind Gesture?',
    a: 'No. A Kind Gesture is an optional, non-transactional acknowledgement such as a private thank-you. A requester can decline any of them, and funding never depends on the answer.',
  },
  {
    q: 'What kinds of bills belong on Settle?',
    a: 'The app models essential bills in categories such as electricity, water, heating, housing, medical, education, internet, transport and childcare. Hard limits are not decided yet. The Guidelines page lists what is set and what is undecided.',
  },
  {
    q: 'Is Settle a bank or a money transmitter?',
    a: 'No. The prototype holds no funds and moves none, and it is not a money-transmission service. If it ever handled real value, that would need legal and compliance review for each place it operates, which has not happened. This is not legal advice.',
  },
  {
    q: 'How do I contribute?',
    a: 'Read CONTRIBUTING.md and the Code of Conduct, then open an issue or a focused pull request on GitHub. Code lives in the settle repository, and the settlement service lives in settle-api. Never include real bills, keys or personal data.',
  },
  {
    q: 'How do I report a security problem?',
    a: 'Do not open a public issue. Follow SECURITY.md in the repository for the private reporting route, and leave real keys and personal documents out of the report.',
  },
];

export const BILL_CATEGORIES = [
  'Electricity',
  'Water',
  'Heating',
  'Housing',
  'Medical',
  'Education',
  'Internet',
  'Transport',
  'Childcare',
  'Other',
] as const;

export const KIND_GESTURES = [
  { name: 'No response needed', text: 'Give quietly with no acknowledgement expected.' },
  { name: 'A private thank-you', text: 'An optional note, without sharing contact details.' },
  { name: 'A future update', text: 'The requester may share how the support helped.' },
  { name: 'Pay kindness forward', text: 'An invitation to help someone else someday, only if able.' },
  { name: 'Add a dedication', text: 'A short dedication attached to the support.' },
] as const;
