import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton, formatMoney } from '@/components/ui/primitives';
import { Fonts, SettleColors } from '@/constants/theme';
import { stroopsToAmount } from '@/services/amount';
import {
  FundingError,
  awaitConfirmation,
  verifyQuote,
  verifySignedMatchesUnsigned,
  type FundingOutcome,
} from '@/services/funding-flow';
import {
  SettlementApiError,
  describeSettlementError,
  getBill,
  newIdempotencyKey,
  receiptUrl,
  requestQuote,
  submitSignedPayment,
  type ApiBill,
  type ApiQuote,
} from '@/services/settlement-client';
import { explorerTransactionUrl } from '@/services/stellar';
import { describeWalletError, getWalletAdapter, WalletError } from '@/services/wallet';
import type { Bill } from '@/types/domain';

const fontTokens = Fonts as typeof Fonts & { display?: string; body?: string };
const displayFont = fontTokens.display ?? Fonts.sans;
const bodyFont = fontTokens.body ?? Fonts.sans;

type Phase =
  | { name: 'idle' }
  | { name: 'working'; label: string }
  | { name: 'review'; quote: ApiQuote; sourceAccount: string }
  | { name: 'resubmit'; quote: ApiQuote; sourceAccount: string; signedXdr: string; message: string }
  | { name: 'result'; outcome: FundingOutcome; quote: ApiQuote }
  | { name: 'problem'; title: string; message: string; expired?: boolean };

export type LiveFundingPanelProps = {
  bill: Bill;
  /** The amount the supporter chose, in minor units. Zero or invalid disables the action. */
  amountMinor: number;
  amountValid: boolean;
  onClose: () => void;
};

const clock = () => Date.now();
const shorten = (value: string) => (value.length > 16 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value);

/**
 * Real testnet funding against a configured settlement API. Every state that is not a server-confirmed payment
 * with a matching receipt is shown as not paid, pending, or failed.
 */
export function LiveFundingPanel({ bill, amountMinor, amountValid, onClose }: LiveFundingPanelProps) {
  const [phase, setPhase] = useState<Phase>({ name: 'idle' });
  const [serverBill, setServerBill] = useState<ApiBill | null>(null);
  const [billNote, setBillNote] = useState<string | null>(null);
  const [now, setNow] = useState(clock);
  const mounted = useRef(true);
  const quoteKey = useRef<string | null>(null);
  const paymentKey = useRef<string | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // The server, not the sample card, decides what a bill still needs.
  useEffect(() => {
    let active = true;
    setServerBill(null);
    setBillNote('Checking this bill with the settlement service.');
    getBill(bill.id)
      .then((value) => {
        if (!active) return;
        setServerBill(value);
        setBillNote(null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        const missing = error instanceof SettlementApiError && error.status === 404;
        setBillNote(
          missing
            ? 'The settlement service does not know this bill, so it cannot be funded on testnet.'
            : describeSettlementError(error),
        );
      });
    return () => {
      active = false;
    };
  }, [bill.id]);

  useEffect(() => {
    if (phase.name !== 'review') return;
    const timer = setInterval(() => setNow(clock()), 1000);
    return () => clearInterval(timer);
  }, [phase.name]);

  const safeSet = useCallback((next: Phase) => {
    if (mounted.current) setPhase(next);
  }, []);

  const serverRemaining = serverBill ? Number(serverBill.remainingMinor) : null;
  const billBlock = (() => {
    if (!serverBill) return billNote;
    if (serverBill.status !== 'open') return 'This bill is not open for contributions on the settlement service.';
    if (serverBill.currency !== bill.total.currency) return 'The service lists this bill in a different currency. It cannot be funded here.';
    if (serverRemaining !== null && Number.isFinite(serverRemaining) && amountMinor > serverRemaining) {
      return `The service says only ${formatMoney(serverRemaining / 100, serverBill.currency)} of this bill is still open.`;
    }
    return null;
  })();

  const getQuote = async () => {
    safeSet({ name: 'working', label: 'Connecting your wallet' });
    try {
      const wallet = getWalletAdapter();
      const availability = await wallet.availability();
      if (!availability.available) {
        safeSet({ name: 'problem', title: 'Wallet not found', message: `${availability.reason} Nothing was paid.` });
        return;
      }
      const session = await wallet.connect();
      safeSet({ name: 'working', label: 'Requesting a quote from the settlement service' });
      quoteKey.current ??= newIdempotencyKey();
      const request = { billId: bill.id, amountMinor, currency: bill.total.currency, sourceAccount: session.publicKey };
      const quote = await requestQuote(request, quoteKey.current);
      quoteKey.current = null;
      verifyQuote(quote, request);
      paymentKey.current = newIdempotencyKey();
      setNow(clock());
      safeSet({ name: 'review', quote, sourceAccount: session.publicKey });
    } catch (error) {
      if (!(error instanceof SettlementApiError) || (error.kind !== 'unreachable' && error.kind !== 'timeout')) quoteKey.current = null;
      safeSet(problemFrom(error));
    }
  };

  const signAndSubmit = async (quote: ApiQuote, sourceAccount: string) => {
    if (Date.parse(quote.expiresAt) <= clock()) {
      safeSet({ name: 'problem', title: 'Quote expired', message: 'This quote expired before it was signed. Nothing was paid. Request a new quote.', expired: true });
      return;
    }
    safeSet({ name: 'working', label: 'Waiting for your wallet to sign' });
    let signedXdr: string;
    try {
      const wallet = getWalletAdapter();
      signedXdr = await wallet.signTransaction({ unsignedXdr: quote.unsignedXdr, networkPassphrase: quote.networkPassphrase });
      verifySignedMatchesUnsigned(quote.unsignedXdr, signedXdr, quote.networkPassphrase);
    } catch (error) {
      safeSet(problemFrom(error));
      return;
    }
    await submit(quote, sourceAccount, signedXdr);
  };

  const submit = async (quote: ApiQuote, sourceAccount: string, signedXdr: string) => {
    safeSet({ name: 'working', label: 'Submitting the signed payment' });
    paymentKey.current ??= newIdempotencyKey();
    try {
      const payment = await submitSignedPayment({ quoteId: quote.quoteId, signedXdr }, paymentKey.current);
      safeSet({ name: 'working', label: 'Waiting for independent confirmation on Stellar' });
      const outcome = await awaitConfirmation(payment, quote);
      safeSet({ name: 'result', outcome, quote });
    } catch (error) {
      if (error instanceof SettlementApiError && error.outcomeUnknown) {
        safeSet({ name: 'resubmit', quote, sourceAccount, signedXdr, message: describeSettlementError(error) });
        return;
      }
      safeSet(problemFrom(error));
    }
  };

  const reset = () => {
    quoteKey.current = null;
    paymentKey.current = null;
    setPhase({ name: 'idle' });
  };

  if (phase.name === 'working') {
    return (
      <View accessibilityLiveRegion="polite" style={styles.panel}>
        <ActionButton label={phase.label} loading disabled onPress={() => undefined} />
        <Text style={styles.small}>Do not close this panel while a payment is being signed or confirmed.</Text>
      </View>
    );
  }

  if (phase.name === 'review') {
    const { quote, sourceAccount } = phase;
    const seconds = Math.max(0, Math.floor((Date.parse(quote.expiresAt) - now) / 1000));
    const expired = seconds === 0;
    const usdc = quote.usdc?.amount ?? stroopsToAmount(BigInt(quote.usdcAmountStroops));
    const feeStroops = quote.fees?.network?.stroops;
    return (
      <View style={styles.panel}>
        <Text style={styles.heading}>REVIEW THE SERVER QUOTE</Text>
        <Row label="You pay" value={`${usdc} USDC`} strong />
        <Row label="Covers" value={formatMoney(Number(quote.fiat?.amountMinor ?? amountMinor) / 100, quote.fiat?.currency ?? bill.total.currency)} />
        <Row label="Paid directly to" value={`${quote.provider?.displayName ?? 'Provider'}${quote.provider?.fixture ? ' (testnet fixture, not a real provider)' : ''}`} />
        <Row label="Destination" value={shorten(quote.destination)} />
        <Row label="Rate" value={quote.rate?.source === 'testnet-fixture' ? 'Illustrative testnet rate, not market data' : 'See quote'} />
        <Row label="Network fee" value={feeStroops ? `${stroopsToAmount(BigInt(feeStroops))} XLM, paid by you` : 'Not stated by the service'} />
        <Row label="Settle fee" value={quote.fees?.platform?.bps === 0 ? 'None (0%)' : 'Not stated by the service'} />
        <Row label="From wallet" value={shorten(sourceAccount)} />
        <Row label="Memo" value={quote.memo} />
        <Text accessibilityLiveRegion="polite" style={[styles.small, expired && styles.warn]}>
          {expired ? 'This quote has expired. Request a new one.' : `Quote expires in ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}.`}
        </Text>
        {expired ? (
          <ActionButton label="Request a new quote" onPress={reset} />
        ) : (
          <ActionButton label="Sign in your wallet and pay (testnet)" onPress={() => void signAndSubmit(quote, sourceAccount)} />
        )}
        <ActionButton label="Cancel" tone="secondary" onPress={reset} />
      </View>
    );
  }

  if (phase.name === 'resubmit') {
    return (
      <View accessibilityLiveRegion="polite" style={[styles.panel, styles.warnPanel]}>
        <Text style={styles.heading}>PAYMENT STATUS UNKNOWN</Text>
        <Text style={styles.body}>{phase.message}</Text>
        <Text style={styles.small}>It is not counted as paid. Retrying sends the same signed payment with the same key, so it cannot pay twice.</Text>
        <ActionButton label="Retry submission" onPress={() => void submit(phase.quote, phase.sourceAccount, phase.signedXdr)} />
        <ActionButton label="Close" tone="secondary" onPress={onClose} />
      </View>
    );
  }

  if (phase.name === 'result') {
    const { outcome } = phase;
    const hash = outcome.payment.txHash;
    return (
      <View accessibilityLiveRegion="polite" style={[styles.panel, outcome.kind === 'confirmed' ? styles.okPanel : styles.warnPanel]}>
        <Text style={styles.heading}>
          {outcome.kind === 'confirmed' ? 'CONFIRMED ON STELLAR TESTNET' : outcome.kind === 'failed' ? 'PAYMENT FAILED' : outcome.kind === 'pending' ? 'NOT CONFIRMED YET' : 'NOT VERIFIED'}
        </Text>
        {outcome.kind === 'confirmed' ? (
          <Text style={styles.body}>
            The service re-read the transaction from the network and it matched the quote. This is a testnet payment, not real money.
          </Text>
        ) : (
          <Text style={styles.body}>{outcome.message}</Text>
        )}
        {outcome.kind === 'confirmed' ? <Row label="Receipt" value={outcome.receipt.id} /> : null}
        <Row label="Transaction" value={shorten(hash)} />
        <LinkRow label="View transaction on Stellar Expert (testnet)" url={explorerTransactionUrl(hash)} />
        {outcome.kind === 'confirmed' ? <LinkRow label="Open receipt (JSON from the service)" url={receiptUrl(outcome.receipt.id)} /> : null}
        <ActionButton label="Done" onPress={onClose} />
      </View>
    );
  }

  if (phase.name === 'problem') {
    return (
      <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={[styles.panel, styles.warnPanel]}>
        <Text style={styles.heading}>{phase.title.toUpperCase()}</Text>
        <Text style={styles.body}>{phase.message}</Text>
        <ActionButton label={phase.expired ? 'Request a new quote' : 'Try again'} onPress={reset} />
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      {billBlock ? <Text accessibilityLiveRegion="polite" style={styles.small}>{billBlock}</Text> : null}
      {serverBill && !billBlock ? (
        <Text style={styles.small}>
          Service shows {formatMoney(Number(serverBill.remainingMinor) / 100, serverBill.currency)} still open on this bill.
        </Text>
      ) : null}
      <ActionButton
        label={!amountValid ? 'Choose a valid amount' : 'Connect wallet and get a quote'}
        disabled={!amountValid || Boolean(billBlock)}
        onPress={() => void getQuote()}
      />
    </View>
  );
}

function problemFrom(error: unknown): Phase {
  if (error instanceof FundingError) {
    return { name: 'problem', title: error.code === 'quote_expired' ? 'Quote expired' : error.code === 'signed_mismatch' ? 'Signature check failed' : 'Quote check failed', message: error.message, expired: error.code === 'quote_expired' };
  }
  if (error instanceof WalletError) {
    return { name: 'problem', title: error.code === 'rejected' ? 'Wallet declined' : 'Wallet problem', message: describeWalletError(error) };
  }
  if (error instanceof SettlementApiError) {
    const expired = error.code === 'quote_expired';
    return {
      name: 'problem',
      title: expired ? 'Quote expired' : error.kind === 'unreachable' || error.kind === 'timeout' ? 'Service unreachable' : 'Request refused',
      message: describeSettlementError(error),
      expired,
    };
  }
  return { name: 'problem', title: 'Something went wrong', message: describeWalletError(error) };
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text selectable style={[styles.rowValue, strong && styles.rowStrong]}>{value}</Text>
    </View>
  );
}

function LinkRow({ label, url }: { label: string; url?: string }) {
  if (!url) return null;
  return (
    <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(url)} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 10, padding: 14, borderRadius: 10, borderWidth: 3, borderColor: SettleColors.ink, backgroundColor: SettleColors.paper },
  okPanel: { backgroundColor: SettleColors.mint },
  warnPanel: { backgroundColor: SettleColors.blush },
  heading: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 12, letterSpacing: 1 },
  body: { color: SettleColors.ink, fontFamily: bodyFont, fontSize: 13, lineHeight: 19 },
  small: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 11, lineHeight: 16 },
  warn: { color: SettleColors.ink, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  rowLabel: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 12, flexShrink: 0 },
  rowValue: { color: SettleColors.ink, fontFamily: bodyFont, fontSize: 12, flex: 1, textAlign: 'right' },
  rowStrong: { fontFamily: displayFont, fontSize: 15 },
  link: { color: SettleColors.cobalt, fontFamily: bodyFont, fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' },
});
