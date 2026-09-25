# Multi-tenant POS

The running UI is still the single-store demo. Production data lives in PostgreSQL, described in `supabase/migrations`.

Organizations are `parent`, `child`, or `standalone`. A child has one parent. Inventory belongs to a location (`retail` or `warehouse`), not to `product.stock`.

Money is integer paisa in `lib/domain/money.ts` and `numeric(18,2)` in the database. Tax is calculated only by `lib/domain/tax.ts`.

Server functions must recompute prices and totals. The browser is not allowed to choose `organization_id`, prices, or stock.

FBR and printers are adapters in `lib/tax/provider.ts` and `lib/printing/printer.ts`. The development tax provider does not call FBR.

Apply migrations with the Supabase CLI against your project:

```bash
supabase db push
```

Required environment variables are listed in `.env.example`. Do not put the service-role key in client code.
