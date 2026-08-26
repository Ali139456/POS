# Al-Noor Super Mart POS

Production-quality frontend Point of Sale for a Pakistani grocery / supermarket. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zustand, Recharts, and Sonner.

**Poori functionalities ki detail:** [DOCUMENTATION.md](./DOCUMENTATION.md)

## Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Cashier PIN login: **Ali Hassan / 1234** (`/login`).

## Deploy (Vercel)

The Next.js app lives at the **repository root** (`package.json` with `"next"`). Connect the GitHub repo and deploy — no Root Directory override is needed.

## What is included

- Dark sidebar layout, light/dark theme, Ctrl+K search
- Dashboard KPIs and charts
- Fast POS checkout (barcode search, variants, cart, cash/JazzCash/EasyPaisa/split pay, hold sales, receipts)
- Products, categories, barcodes, inventory, expiry, stock adjustments
- Sales history, invoice detail, returns
- Customers and Khata / Udhaar ledger
- Suppliers and purchase orders (create + receive)
- Expenses, cash register (open/close shift)
- Reports, employees + PIN/permissions, store settings

All flows use a mock data layer in `lib/mock` and Zustand stores in `lib/store`, ready to swap for APIs later.

Currency is **PKR / Rs.** throughout.
