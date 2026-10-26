export type UserRole = 'requester' | 'supporter';

export type BillCategory =
  | 'electricity'
  | 'water'
  | 'heating'
  | 'housing'
  | 'medical'
  | 'education'
  | 'internet'
  | 'transport'
  | 'childcare'
  | 'other';

export type CurrencyCode = 'NGN' | 'GBP' | 'USD' | 'KES' | 'CAD';

/** Monetary values are stored in minor units (for example, cents or kobo). */
export interface Money {
  amountMinor: number;
  currency: CurrencyCode;
}

/**
 * Safe, optional acknowledgements. Contributions are never conditional on a
 * requester accepting or completing one of these gestures.
 */
export type KindGesture =
  | 'none'
  | 'anonymous_thanks'
  | 'progress_update'
  | 'pay_it_forward'
  | 'dedication';

export interface GestureOption {
  id: KindGesture;
  label: string;
  description: string;
  requesterCanDecline: true;
}

export type ContributionStatus =
  | 'pending'
  | 'confirmed'
  | 'failed'
  | 'refunded';

export interface Contribution {
  id: string;
  billId: string;
  amount: Money;
  status: ContributionStatus;
  supporterDisplayName: string;
  isAnonymous: boolean;
  gesture: KindGesture;
  createdAt: string;
}

export type AIReviewStatus = 'pending' | 'passed' | 'needs_human_review';

export type AIReviewFlag =
  | 'possible_duplicate'
  | 'amount_mismatch'
  | 'provider_unconfirmed'
  | 'sensitive_data_redacted'
  | 'manual_review_requested';

export interface AIExtractedField {
  field: 'provider' | 'amount' | 'due_date' | 'account_reference';
  confidence: number;
  redacted?: boolean;
}

export interface AIReview {
  status: AIReviewStatus;
  confidence: number;
  summary: string;
  extractedFields: AIExtractedField[];
  flags: AIReviewFlag[];
  reviewedAt: string;
}

export type VerificationState =
  | 'identity_verified'
  | 'bill_verified'
  | 'provider_confirmed';

export interface RequesterDisplayProfile {
  displayName: string;
  initials: string;
  locationLabel: string;
  memberSinceLabel: string;
  verification: VerificationState[];
  avatar: {
    backgroundColor: string;
    foregroundColor: string;
  };
}

export type BillStatus = 'open' | 'settled' | 'paused' | 'under_review';
export type BillUrgency = 'standard' | 'soon' | 'urgent';

export interface Bill {
  id: string;
  requester: RequesterDisplayProfile;
  title: string;
  story: string;
  category: BillCategory;
  providerDisplayName: string;
  total: Money;
  funded: Money;
  supporterCount: number;
  dueDate: string;
  postedAt: string;
  status: BillStatus;
  urgency: BillUrgency;
  acceptsPartialFunding: boolean;
  paysProviderDirectly: boolean;
  allowedGestures: KindGesture[];
  aiReview: AIReview;
  artwork: {
    /** Symbol key or emoji rendered by the client; never a remote image URL. */
    icon: string;
    backgroundColor: string;
    accentColor: string;
  };
}
