# FBR

`lib/tax/provider.ts` defines `TaxProvider`. `DevTaxProvider` returns `FBR_ACCEPTED` with a `DEV-` reference and does not contact FBR.

`fbr_submissions` stores status, payloads, attempt count, and the next retry time. A failed submission does not delete the sale.

Credentials belong in `organization_secrets`, which the browser roles cannot read.

No production FBR URL or credential is included. Add a second class that implements `TaxProvider` when the official contract is available.
