# Offline sync

Offline storage is not wired yet. The database is ready for it.

Each device sale must send a UUID `client_transaction_id`. `sales` rejects a second insert with the same `(device_id, client_transaction_id)`.

Sync status belongs on the client queue: `PENDING`, `SYNCING`, `SYNCED`, `FAILED`, `CONFLICT`.

If `post_inventory_movement` raises negative stock, the client queue item stays `CONFLICT`. It is not overwritten.

Financial tables are insert-only for a completed sale. Sync does not use last-write-wins.
