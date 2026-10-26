import type { Bill, GestureOption, Money } from '../types/domain';

export const GESTURE_OPTIONS: readonly GestureOption[] = [
  {
    id: 'none',
    label: 'No response needed',
    description: 'Give quietly with no acknowledgement expected.',
    requesterCanDecline: true,
  },
  {
    id: 'anonymous_thanks',
    label: 'A private thank-you',
    description: 'Receive an optional note without sharing contact details.',
    requesterCanDecline: true,
  },
  {
    id: 'progress_update',
    label: 'A future update',
    description: 'The requester may share how the support helped.',
    requesterCanDecline: true,
  },
  {
    id: 'pay_it_forward',
    label: 'Pay kindness forward',
    description: 'An invitation to help someone else someday, only if able.',
    requesterCanDecline: true,
  },
  {
    id: 'dedication',
    label: 'Add a dedication',
    description: 'Attach a short, moderated dedication to the contribution.',
    requesterCanDecline: true,
  },
] as const;

export const demoBills: readonly Bill[] = [
  {
    id: 'bill-amina-electricity',
    requester: {
      displayName: 'Amina K.',
      initials: 'AK',
      locationLabel: 'Lagos, Nigeria',
      memberSinceLabel: 'Member since October 2026',
      verification: ['identity_verified', 'bill_verified', 'provider_confirmed'],
      avatar: { backgroundColor: '#E7E0FF', foregroundColor: '#4E32CB' },
    },
    title: 'Keep the lights on at home',
    story:
      'A delayed freelance payment left a short gap this month. Clearing the remaining balance keeps power steady while I finish two active projects.',
    category: 'electricity',
    providerDisplayName: 'Local electricity provider',
    total: { amountMinor: 4_860_000, currency: 'NGN' },
    funded: { amountMinor: 3_100_000, currency: 'NGN' },
    supporterCount: 8,
    dueDate: '2026-10-29',
    postedAt: '2026-10-24T09:30:00.000Z',
    status: 'open',
    urgency: 'urgent',
    acceptsPartialFunding: true,
    paysProviderDirectly: true,
    allowedGestures: ['none', 'anonymous_thanks', 'pay_it_forward'],
    aiReview: {
      status: 'passed',
      confidence: 0.97,
      summary: 'Amount and due date match the uploaded statement.',
      extractedFields: [
        { field: 'provider', confidence: 0.99 },
        { field: 'amount', confidence: 0.99 },
        { field: 'due_date', confidence: 0.96 },
        { field: 'account_reference', confidence: 0.98, redacted: true },
      ],
      flags: ['sensitive_data_redacted'],
      reviewedAt: '2026-10-24T09:32:00.000Z',
    },
    artwork: { icon: 'bolt.fill', backgroundColor: '#E7E0FF', accentColor: '#6C4DF6' },
  },
  {
    id: 'bill-daniel-heating',
    requester: {
      displayName: 'Daniel R.',
      initials: 'DR',
      locationLabel: 'Manchester, UK',
      memberSinceLabel: 'Member since September 2026',
      verification: ['identity_verified', 'bill_verified'],
      avatar: { backgroundColor: '#FFE45C', foregroundColor: '#18130E' },
    },
    title: 'A warm home while I recover',
    story:
      'My work hours were reduced during injury recovery. Help with this heating bill would make the next few weeks much easier.',
    category: 'heating',
    providerDisplayName: 'Regional energy provider',
    total: { amountMinor: 18_400, currency: 'GBP' },
    funded: { amountMinor: 0, currency: 'GBP' },
    supporterCount: 0,
    dueDate: '2026-11-01',
    postedAt: '2026-10-25T14:15:00.000Z',
    status: 'open',
    urgency: 'soon',
    acceptsPartialFunding: true,
    paysProviderDirectly: true,
    allowedGestures: ['none', 'anonymous_thanks', 'progress_update'],
    aiReview: {
      status: 'passed',
      confidence: 0.94,
      summary: 'The statement appears current and the balance is internally consistent.',
      extractedFields: [
        { field: 'provider', confidence: 0.96 },
        { field: 'amount', confidence: 0.98 },
        { field: 'due_date', confidence: 0.93 },
        { field: 'account_reference', confidence: 0.95, redacted: true },
      ],
      flags: ['sensitive_data_redacted'],
      reviewedAt: '2026-10-25T14:17:00.000Z',
    },
    artwork: { icon: 'flame.fill', backgroundColor: '#FFD4E2', accentColor: '#FF5C93' },
  },
  {
    id: 'bill-maya-prescription',
    requester: {
      displayName: 'Maya S.',
      initials: 'MS',
      locationLabel: 'Austin, USA',
      memberSinceLabel: 'Member since August 2026',
      verification: ['identity_verified', 'bill_verified', 'provider_confirmed'],
      avatar: { backgroundColor: '#FFD4E2', foregroundColor: '#B51E59' },
    },
    title: 'Cover a child’s prescription',
    story:
      'Insurance covered most of the visit, but not the full prescription. The pharmacy can accept support directly toward the remaining balance.',
    category: 'medical',
    providerDisplayName: 'Community pharmacy',
    total: { amountMinor: 12_600, currency: 'USD' },
    funded: { amountMinor: 7_600, currency: 'USD' },
    supporterCount: 3,
    dueDate: '2026-10-30',
    postedAt: '2026-10-23T18:45:00.000Z',
    status: 'open',
    urgency: 'urgent',
    acceptsPartialFunding: true,
    paysProviderDirectly: true,
    allowedGestures: ['none', 'anonymous_thanks'],
    aiReview: {
      status: 'passed',
      confidence: 0.98,
      summary: 'Provider and remaining patient balance were confirmed.',
      extractedFields: [
        { field: 'provider', confidence: 0.99 },
        { field: 'amount', confidence: 0.99 },
        { field: 'due_date', confidence: 0.95 },
        { field: 'account_reference', confidence: 0.99, redacted: true },
      ],
      flags: ['sensitive_data_redacted'],
      reviewedAt: '2026-10-23T18:48:00.000Z',
    },
    artwork: { icon: 'cross.case.fill', backgroundColor: '#C9F2F0', accentColor: '#087C76' },
  },
  {
    id: 'bill-joseph-school-fees',
    requester: {
      displayName: 'Joseph M.',
      initials: 'JM',
      locationLabel: 'Nairobi, Kenya',
      memberSinceLabel: 'Member since October 2026',
      verification: ['identity_verified', 'bill_verified', 'provider_confirmed'],
      avatar: { backgroundColor: '#CBFF36', foregroundColor: '#18130E' },
    },
    title: 'Finish this term without interruption',
    story:
      'A contribution toward the remaining school balance will help keep my daughter enrolled while our household income stabilizes.',
    category: 'education',
    providerDisplayName: 'Local primary school',
    total: { amountMinor: 2_350_000, currency: 'KES' },
    funded: { amountMinor: 850_000, currency: 'KES' },
    supporterCount: 5,
    dueDate: '2026-11-05',
    postedAt: '2026-10-22T07:20:00.000Z',
    status: 'open',
    urgency: 'soon',
    acceptsPartialFunding: true,
    paysProviderDirectly: true,
    allowedGestures: ['none', 'progress_update', 'pay_it_forward'],
    aiReview: {
      status: 'passed',
      confidence: 0.96,
      summary: 'The school invoice and outstanding term balance were verified.',
      extractedFields: [
        { field: 'provider', confidence: 0.98 },
        { field: 'amount', confidence: 0.98 },
        { field: 'due_date', confidence: 0.94 },
        { field: 'account_reference', confidence: 0.96, redacted: true },
      ],
      flags: ['sensitive_data_redacted'],
      reviewedAt: '2026-10-22T07:23:00.000Z',
    },
    artwork: { icon: 'graduationcap.fill', backgroundColor: '#FFE45C', accentColor: '#D36700' },
  },
  {
    id: 'bill-leila-internet',
    requester: {
      displayName: 'Leila A.',
      initials: 'LA',
      locationLabel: 'Toronto, Canada',
      memberSinceLabel: 'Member since July 2026',
      verification: ['identity_verified', 'bill_verified', 'provider_confirmed'],
      avatar: { backgroundColor: '#FFD7BD', foregroundColor: '#A64000' },
    },
    title: 'Internet access for a job search',
    story:
      'Reliable internet kept applications and interviews moving. Four supporters came together and fully settled this month’s service bill.',
    category: 'internet',
    providerDisplayName: 'Home internet provider',
    total: { amountMinor: 9_400, currency: 'CAD' },
    funded: { amountMinor: 9_400, currency: 'CAD' },
    supporterCount: 4,
    dueDate: '2026-10-25',
    postedAt: '2026-10-19T16:00:00.000Z',
    status: 'settled',
    urgency: 'standard',
    acceptsPartialFunding: true,
    paysProviderDirectly: true,
    allowedGestures: ['none', 'anonymous_thanks', 'progress_update', 'dedication'],
    aiReview: {
      status: 'passed',
      confidence: 0.97,
      summary: 'The provider confirmed receipt of the full verified balance.',
      extractedFields: [
        { field: 'provider', confidence: 0.99 },
        { field: 'amount', confidence: 0.98 },
        { field: 'due_date', confidence: 0.97 },
        { field: 'account_reference', confidence: 0.98, redacted: true },
      ],
      flags: ['sensitive_data_redacted'],
      reviewedAt: '2026-10-25T19:10:00.000Z',
    },
    artwork: { icon: 'wifi', backgroundColor: '#FFD7BD', accentColor: '#FF8A3D' },
  },
] as const;

function assertMatchingCurrency(bill: Bill): void {
  if (bill.total.currency !== bill.funded.currency) {
    throw new Error(`Funding currency mismatch for bill ${bill.id}`);
  }
}

export function getRemainingAmount(bill: Bill): Money {
  assertMatchingCurrency(bill);

  return {
    amountMinor: Math.max(0, bill.total.amountMinor - bill.funded.amountMinor),
    currency: bill.total.currency,
  };
}

export function getFundingProgress(bill: Bill): number {
  if (bill.total.amountMinor <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, bill.funded.amountMinor / bill.total.amountMinor));
}

export function getFundingPercentage(bill: Bill): number {
  return Math.round(getFundingProgress(bill) * 100);
}

export function isFullyFunded(bill: Bill): boolean {
  return getRemainingAmount(bill).amountMinor === 0;
}

export function formatMoney(money: Money, locale?: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currency,
    maximumFractionDigits: 2,
  }).format(money.amountMinor / 100);
}
