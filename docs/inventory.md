# Inventory

`inventory_balances` is the current quantity for a location, variant, and batch.

`inventory_transactions` is append-only. Each row stores quantity before, change, and after.

`post_inventory_movement` locks the balance row, rejects negative stock unless the organization allows it, then inserts the ledger row.

A purchase order does not call this function. A goods receipt does, with movement type `PURCHASE`.

A transfer deducts at dispatch (`TRANSFER_OUT`) and adds at receipt (`TRANSFER_IN`). Each quantity is posted once.

Unit conversion in `lib/domain/inventory.ts` uses milli-units. `1 carton = 24 pieces` is a factor of `24000` milli per carton.
