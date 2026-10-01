# Karwan Rahiyaan Noor — implementation plan

## Product workflow

Enquiry → pilgrim and passport registration → package / group allocation → quotation and booking → visa case → airline PNR and ticket → supplier settlement → departure → return → final reconciliation. Individual pilgrims can bypass the group allocation step. One pilgrim may hold multiple bookings but one passport identity.

## Access

Admin manages staff, settings and all records. Manager manages operations. Sales registers agents, pilgrims and bookings. Visa staff handles documents and applications. Finance posts receipts, supplier payments and adjustments. Viewer has read access. Financial corrections are reversals with reason and approval, never destructive edits.

## Financial model for production phase

Use double-entry journals with accounts for cash, bank, agent receivables, pilgrim receivables, supplier payables, revenue, cost, commission and refunds. Every journal balances, is immutable after posting, has currency and exchange rate, and links a booking or supplier invoice. Party statements derive opening balance plus signed journal lines. Separate drafts from posted entries, support receipt numbers, attachments, approval thresholds, bank reconciliation, expense categories, tax fields, and PDF vouchers. Current starter ledger is an append-only transaction register and is not yet an accounting-grade double-entry system.

## Travel entities

Agents, subagents, group leaders (salars), pilgrims, passports, family links, packages, departure groups, seats, bookings, visa cases, document checklist, embassy submissions, airlines, PNRs, tickets, hotels, rooms, transport, border legs, suppliers, invoices, payments and refunds. Support Iran, Iraq, Syria and Saudi Arabia itineraries; Makkah and Madinah are city stops under Saudi Arabia. Store group and individual visa/ticket types explicitly.

## Passport scanning

Capture photo or PDF over HTTPS → private storage → OCR of ICAO machine-readable zone (MRZ) → checksum verification and confidence score → prefill name, passport number, nationality, birth date, sex and expiry → show image and parsed values side by side → user confirms and corrects → duplicate/passport expiry warnings → save audit entry. Manual entry remains available. A standard MRZ has no address or phone, so those fields must be entered separately. Do not claim that all passport data is available from one scan.

## WhatsApp

Use an approved WhatsApp Business Platform provider with opt-in records, approved templates, language, delivery status webhooks and queue retries. Trigger events for registration confirmation, payment receipt, due balance, visa status, ticket issue, group itinerary and departure reminders. Show a preview and let staff approve sensitive or financial messages. Store provider message IDs and error states, never send twice after retries. Consent and message templates are prerequisites for automatic sending.

## PWA and deployment

Installable HTTPS app, mobile navigation and cache for the app shell. Do not cache passports, bank details or authenticated API responses. Offline edits need a future conflict-safe queue and clear sync state. Supabase Auth, RLS and private object storage protect data. Backups, monitoring, environment secrets and access review are required before live use.

## Delivery sequence

1. Foundation: schema, sign in, staff roles, dashboard, registries, responsive PWA shell (implemented starter).
2. Booking workflows: linked selectors, group seat inventory, package pricing and case status updates (version 0.4 implemented). Document storage and automatic invoice generation remain to build.
3. Finance: cash/bank entries, customer invoices, supplier bills, party statements, cash book and printable vouchers (version 0.3 implemented). Double-entry journal, commissions, reconciliation and multi-currency remain to build.
4. Passport OCR: MRZ service, checksums, correction screen and private storage.
5. WhatsApp provider: consent, templates, queue, webhooks and delivery monitoring.
6. Production verification: role tests, reconciliation examples, data migration, backup/restore and device testing.

## Decisions needed before live rollout

Legal business address, branding assets, staff emails and roles, actual package prices, payment accounts, preferred WhatsApp Business provider, passport retention period, whether agents get their own login, and any existing data to import. Avoid entering real traveller records in a demonstration environment.
