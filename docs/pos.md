# POS

The current `/pos` screen is the demo. Production checkout must call a server function that:

1. Loads the variant price and tax rate from the database.
2. Runs `calculateInvoice` in `lib/domain/tax.ts`.
3. Inserts `sales`, `sale_items`, and `sale_payments` with the server totals.
4. Posts `SALE` movements through `post_inventory_movement`.
5. Stores `client_transaction_id` from the device.

Barcode input must keep focus and accept a scanner suffix of Enter. That handler is not on the demo screen yet.

Payments are rows in `sale_payments`. Card numbers are not stored.
