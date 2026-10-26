# Privacy design: evidence redaction and retention

Status: partial implementation. The companion [settle-api evidence service](https://github.com/Anasabubakar/settle-api/blob/main/docs/evidence-api.md) now has encrypted local quarantine, a restricted manual review step, an allowlisted redacted summary, an audit log, and retention purge support. The app still selects files locally and does not upload real bills. Automated redaction, malware scanning, individual reviewer authorization, and authenticated client upload are not yet implemented.

## Principles

1. **Collect the least that proves the bill.** Evidence exists to let a reviewer confirm a provider, an amount and a due date, not to describe a person.
2. **Redact before anything else sees it.** Redaction happens before model processing, before human review and before any supporter-facing display.
3. **Supporters never see raw evidence.** They see extracted, redacted fields and a verification status.
4. **No training on uploads without separate, revocable consent.** Default is off and it is never bundled with using the app.

## Client / server boundary

| Step | Where | Notes |
|---|---|---|
| Pick a file, show a local preview | Client | Nothing leaves the device yet |
| Strip metadata (EXIF, GPS, PDF author/producer) | Client, then re-checked on server | Defence in depth; the server never trusts the client's stripping |
| Upload over TLS to a private bucket | Client → server | Signed, short-lived upload URL; per-file size and type limits |
| Malware scan, type sniffing, page/size limits | Server | Rejected files are deleted immediately |
| Field extraction (provider, amount, due date, reference) | Server | Runs on the redacted copy |
| Redaction of everything else | Server | Account holder name beyond the needed form, address, phone, email, ID numbers, full account numbers |
| Human review | Server, restricted | See access rules below |
| Display to supporters | Server → client | Redacted fields only, never the original file |

## Fields: needed versus removed

| Field | Kept | Why | Form kept |
|---|---|---|---|
| Provider name | Yes | Destination verification | Full |
| Provider account/reference | Yes | Matching payment to the bill | Last 4 characters shown, full value server-side only |
| Amount due and currency | Yes | Quote | Full |
| Due date | Yes | Urgency, expiry | Full |
| Bill category | Yes | Discovery | Full |
| Requester first name or alias | Yes | Human context | Chosen by the requester |
| Requester full legal name | Reviewer only | Identity match | Removed from the redacted copy |
| Home address, phone, email | No | Not needed to pay a provider | Removed |
| Government ID, tax number | No | Never needed | Removed; upload rejected if the whole document is an ID |
| Medical details (diagnosis, itemised procedures) | No | Sensitive | Removed; keep only provider and total |
| Free-text notes | Reviewer only | Context | Not shown to supporters |

## Retention

| Data | Retention | Then |
|---|---|---|
| Original upload | Until review finishes, at most 30 days | Deleted |
| Redacted copy | While the request is open, plus 90 days | Deleted |
| Extracted fields | Life of the request, plus 90 days | Deleted or reduced to an anonymous aggregate |
| Receipts and payment records | As required by law and dispute handling, at least the dispute window | Kept without personal evidence |
| Review audit log | 12 months | Deleted; contains reviewer id, action and time, not content |

The periods are proposals to be confirmed by legal review per operating jurisdiction.

## Deletion requests

- A requester can delete a request and its evidence from the app. The original and redacted copy are removed immediately; backups age out within 35 days.
- Payment receipts are not erased while a legal or dispute hold applies. They contain no evidence images and only the redacted fields above.
- A deletion is confirmed to the requester and recorded (who, when, what class of data), without keeping the deleted content.

## Human-review access

- Named reviewers only, with role-based access, per-request (not bulk) access and a reason logged for every open.
- Reviewers see the original only when redaction confidence is low; otherwise the redacted copy.
- No download or export of originals; view-only, watermarked with the reviewer id.
- Access is audited and reviewed periodically. Review of a request is blocked for anyone who knows the requester.

## Model use

- Extraction models receive the redacted copy only, under a no-retention, no-training arrangement.
- Using uploads to improve models requires separate opt-in consent, can be withdrawn, and withdrawal removes the data from future training sets.

## Fixture strategy (non-sensitive test data)

- All tests and demos use synthetic bills generated from a script: fake providers, fake names, reserved or invalid account numbers, and obviously synthetic watermarks.
- No real bill, even redacted, is committed to the repository or used in screenshots.
- Fixtures include adversarial cases: a bill containing an ID number, a bill with EXIF GPS data, a bill with a long free-text note, an unreadable scan, and a document that is entirely an ID.
- Redaction is tested against these fixtures with assertions that removed fields do not appear in extracted output, logs or error messages.

## Open questions

Jurisdiction-specific retention, data-subject request handling beyond deletion, and whether provider-supplied bills (instead of requester uploads) can replace evidence upload for some providers.
