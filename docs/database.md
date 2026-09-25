# Database

Migrations in `supabase/migrations`:

1. `0001_schema.sql` — organizations, locations, catalog, inventory ledger, purchasing, sales, transfers, cash, FBR queue, audit.
2. `0002_rls.sql` — tenant isolation. Parent members can read child rows. Child members cannot.
3. `0003_permissions.sql` — permission catalog and system roles.
4. `0004_inventory_post.sql` — `post_inventory_movement` is the only stock write.

`sales` is unique on `(device_id, client_transaction_id)` so a replayed offline sale cannot insert twice.

`organization_secrets` is revoked from `anon` and `authenticated`.
