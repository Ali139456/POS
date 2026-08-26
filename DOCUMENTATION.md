# Al-Noor Super Mart POS — Documentation

Yeh document **Al-Noor Super Mart POS** ki saari functionalities explain karta hai. App Pakistani mart / grocery / supermarket ke liye bani hai. Currency **PKR (Rs.)** hai. Is version mein data **mock / in-memory** hai — refresh karne se demo data reset ho jata hai. Backend API abhi connected nahi.

---

## 1. Project kya hai?

Yeh ek complete **Point of Sale (POS)** frontend hai. Cashier counter par sale karta hai, manager inventory aur khata dekhte hain, owner reports aur cash register handle karta hai.

**Tech stack**

| Cheez | Use |
| --- | --- |
| Next.js 16 (App Router) | Pages / routing |
| React 19 + TypeScript | UI |
| Tailwind CSS v4 | Design / responsive layout |
| Zustand | Cart, products, sales, shift state |
| Recharts | Dashboard aur reports ke charts |
| Sonner | Toast notifications |
| next-themes | Light / Dark mode |

App folder: repo root (`package.json` yahan hai)

---

## 2. Kaise chalayein

```bash
pnpm install
pnpm dev
```

Browser: [http://localhost:3000](http://localhost:3000)

Pehle `/login` khulega. Employee select karein, 4-digit PIN type karein, **OK** dabayein.

### Demo login PINs

| Employee | Role | PIN |
| --- | --- | --- |
| Ali Hassan | Cashier | `1234` |
| Fatima Khan | Manager | `2468` |
| Usman Malik | Owner | `0000` |
| Ayesha Raza | Inventory Manager | `4321` |
| Bilal Ahmed | Cashier | `1111` |

---

## 3. Common UI (har page par)

### Sidebar
- **Desktop:** full menu (icon + name), store name, logged-in user
- **Tablet:** icon-only compact sidebar
- **Mobile:** hamburger → slide-in drawer
- Sidebar collapse button large screens par available hai
- Profile card ke **⋮** (3 dots) se **Logout** hota hai
- **Settings** alag sidebar item hai (profile footer mein nahi)

### Header
- Page title
- Current date + **Shift open / Closed**
- Global search (**Ctrl + K**)
- Light / Dark theme toggle
- Notification bell (low stock, expiry, khata, register alerts)
- Chhoti screens par extra controls **More (⋯)** menu mein chale jate hain

### Ctrl + K command palette
Yahan se jaldi search / jump:

- Pages (Dashboard, POS, Sales, Products, …)
- Products
- Customers
- Invoices
- Suppliers

### Responsive
Desktop, laptop (**1366×768 POS monitors**), tablet aur mobile ke liye alag layouts hain. POS par mobile mein cart neeche sticky bar se khulti hai.

---

## 4. Modules (functionalities)

### 4.1 Login — `/login`

- Cashier / manager list se user select
- 4-digit PIN keypad (touch-friendly)
- Galat PIN par error toast
- Sahi PIN ke baad Dashboard / last flow

---

### 4.2 Dashboard — `/`

Store ka daily snapshot:

**KPI cards**

- Today's Sales
- Today's Profit
- Total Orders
- Average Order
- Cash Sales
- Card / Online (Card, Bank Transfer, JazzCash, EasyPaisa)

**Aur views**

- **Sales Overview** chart — Today / 7 Days / 30 Days / 3 Months / 1 Year
- **Payment Methods** mix (Cash, Card, JazzCash, EasyPaisa, Credit)
- **Top Selling Products** — units, revenue, profit
- **Low Stock Alerts** — Restock button → Purchase Order
- **Recent Sales** — invoice click se detail
- **Business Statistics** — products, inventory value, customers, suppliers, customer credit, supplier payables

**Open POS** button se seedha checkout khulta hai.

---

### 4.3 POS Checkout — `/pos`  (sab se important)

Yeh cashier ka main screen hai.

**Product side**

- Search: name, SKU, ya **barcode**
- Category chips: All, Grocery, Beverages, Snacks, Dairy, Frozen, Bakery, Household, …
- Product cards: price, stock, variants badge
- Variant wale items (jaise Coca Cola) par size/option dialog
- Out of stock items disable

**Cart**

- Line items, qty +/− (touch size ~44px)
- Per-item discount
- Walk-in ya selected customer
- Order-level discount (Rs. ya %)
- Hold sale (park cart)
- Clear cart (confirm)
- Subtotal, discounts, tax, round off, **Grand Total**
- **Pay Now**

**Payment**

- Cash (amount received, change, quick buttons: Exact, 500, 1000, 2000, 5000, 10000)
- Card
- Bank Transfer
- JazzCash
- EasyPaisa
- Customer Credit (khata / udhaar) — walk-in par nahi
- **Split Payment** (do methods, total match hona zaroori)

Sale complete hone par:

- Invoice number generate
- Stock ghat'ta hai
- Receipt preview: Print / Download / WhatsApp / Email (demo toasts)
- New Sale

**Held sales**

- Header **Held** button se parked carts
- Resume karke sale continue
- Delete hold

**Keyboard shortcuts (desktop)**

| Key | Action |
| --- | --- |
| F1 | Search focus |
| F2 | Customer selector |
| F4 | Hold current sale |
| F8 / F9 / F10 | Pay |
| Esc | Dialog / cart close |
| Ctrl + K | Global search |

**Mobile / tablet POS**

- Neeche sticky bar: `5 items — Rs. 4,850 | View Cart`
- Cart full-screen ya side sheet
- Pay Now cart ke andar sticky rehta hai

---

### 4.4 Sales — `/sales`

Completed invoices ki history.

- Search: invoice, customer, cashier
- Filter: today / yesterday / 7 days / 30 days
- Payment method filter
- Mobile: card list; desktop: table
- Actions: View, Print, Return, **Void**

**Invoice detail** `/sales/[id]`

- Store + invoice header
- Line items, discounts, tax, total
- Payment method / reference
- Receipt preview
- Print, Download, WhatsApp, Return Item, Void Sale

Void hone par sale **Voided** mark hoti hai (demo ledger).

---

### 4.5 Products — `/products`

Poora catalog.

- Search: name, SKU, barcode, brand
- Filters: category, stock (in / low / out), supplier, Active/Inactive
- Table (desktop) / cards (mobile)
- Add Product, Edit, duplicate-style copy, delete (confirm)
- Print Barcodes, Export CSV, Import CSV (import demo toast)

**Add / Edit** `/products/new`, `/products/[id]`

- Name, description, category, brand
- SKU + barcode generate
- Purchase / selling / wholesale / min selling price
- Auto profit + margin
- Stock, min/max, unit (Piece, KG, Liter, …)
- Supplier, manufacturing / expiry date, batch
- Variants table (agar product par variants hain)

**Barcodes** `/products/barcodes`

- Product select, quantity, label size (small / medium / large)
- Print sheet

---

### 4.6 Categories — `/categories`

POS tabs organize karne ke liye.

- New category add
- Card grid: name, product count
- Delete (confirm)

---

### 4.7 Inventory — `/inventory`

Stock control.

**KPIs:** Inventory Value, Total Products, Low Stock, Out of Stock, Expiring Soon

- Product list: available, reserved, min, purchase price, value, status
- **Adjust stock:** Stock In, Stock Out, Damage, Expired, Lost, Correction, Personal Use, Other
- Reason + notes
- **Movement history:** date, product, type, qty, previous → new stock, employee

**Expiry** `/inventory/expiry`

- Windows: Expired, 7 / 30 / 60 / 90 days
- Batch, qty, expiry date, days left, stock value, Critical / Watch status

---

### 4.8 Purchase Orders — `/purchase-orders`

Supplier se restock.

- PO list: number, supplier, date, expected delivery, total, status
- Status: Draft, Ordered, Partially Received, Received, Cancelled
- **Receive:** ordered vs received qty (partial receive supported)
- Cancel PO

**Create PO** `/purchase-orders/new`

- Supplier, date, expected delivery
- Add product lines (qty × cost)
- Discount, tax (currently 0%), total
- Save → Ordered

---

### 4.9 Suppliers — `/suppliers`

Distributors / mandi vendors.

- Company, contact, phone, email, NTN
- Total purchases + outstanding balance
- Create PO, open profile

**Supplier profile** `/suppliers/[id]`

- Contact + payable
- Record supplier payment
- Ledger
- Products supplied

---

### 4.10 Customers — `/customers`

- Types: Walk-in, Regular, Wholesale, VIP
- Search name / phone
- Purchases, orders, avg order, **credit (khata)**, loyalty points
- Add customer
- Delete (confirm)
- Profile: `/customers/[id]` — stats, credit ledger, purchase history, returns count

---

### 4.11 Khata / Udhaar — `/customers/khata`

Pakistani mart credit ledger.

Har customer ke liye:

- Total credit, paid, outstanding
- Last payment date
- Status: Paid / Due / Overdue
- **Record payment** (customer ne udhaar wapas diya)
- **Give credit** (manual udhaar)
- Print / WhatsApp statement (demo)

POS par **Customer Credit** se sale is ledger mein debit karti hai.

---

### 4.12 Returns — `/returns`

- Invoice number se ticket dhundein
- Line-wise return qty
- Reason: Damaged, Wrong Product, Expired, Customer Changed Mind, Other
- Refund: Cash, Store Credit, Original Payment Method
- Refund total
- Past returns list

---

### 4.13 Expenses — `/expenses`

Shop overhead.

- Monthly total, entries, largest expense
- Category chart (Rent, Electricity, Gas, Internet, Salary, Transport, …)
- Add expense: title, category, amount, date, payment method, description

---

### 4.14 Cash Management — `/cash`

Rozana cash drawer / shift.

**Dikhta hai**

- Opening balance
- Cash sales
- Cash refunds
- Cash in / Cash out
- Expected cash
- Shift status (Open / Closed)
- Movement list

**Actions**

- **Cash in** / **Cash out** — reason: Petty Expense, Owner Withdrawal, Supplier Payment, Cash Deposit
- **Close shift** — actual cash count, difference (Exact / Short / Over), notes
- Closed shift ke baad **Open shift** (demo opening Rs. 15,000)

---

### 4.15 Reports — `/reports`

Date range chips: today, yesterday, week, month, last month, year.

Export CSV / Excel / PDF (toolbar) + Print.

| Report | Kya dikhata hai |
| --- | --- |
| Sales Report | Gross/net sales, orders, items sold, avg order, chart |
| Profit Report | Revenue − COGS − expenses share = net profit |
| Product Sales | Units, revenue, profit; best vs slow moving |
| Category Sales | Category-level performance |
| Inventory / Stock Movement | On-hand value, low-stock SKUs |
| Purchase / Supplier / Customer | Period summary (demo text + export) |
| Credit / Khata | Outstanding customer credit |
| Expense Report | Category bar chart |
| Cash Register | Shift cash summary |
| Tax Report | Tax currently 0% in store settings |
| Employee Performance | Tickets + sales per cashier |

---

### 4.16 Employees — `/employees`

- Cards: name, role, phone, PIN, status
- **Switch** — bina logout ke dusre user se sign in (demo)
- Add / Edit employee
- Role: Owner, Admin, Manager, Cashier, Inventory Manager
- Permissions checkboxes:
  - Apply Discount
  - Change Product Price
  - Delete Sale
  - Void Invoice
  - Issue Refund
  - View Profit
  - Manage Inventory
  - Manage Expenses
  - View Reports
  - Manage Employees

---

### 4.17 Settings — `/settings`

| Tab | Function |
| --- | --- |
| Store Information | Name, phone, WhatsApp, email, address, NTN, STRN |
| POS Settings | Barcode-first search, F-keys, Walk-in default (info) |
| Receipt Settings | Logo, address, phone, NTN, cashier, customer, barcode, tax, discount, footer, size 58mm / 80mm / A4, live preview |
| Tax Settings | Sales tax % |
| Payment Methods | Cash, Card, Bank Transfer, JazzCash, EasyPaisa, Customer Credit enable/disable |
| Inventory Settings | Low-stock alert rule |
| Barcode Settings | Default label size |
| Users & Permissions | Employees page par manage |
| Backup | Mock JSON export |
| Notifications | Bell alerts ka description |

---

## 5. Typical daily workflow (cashier)

1. Login (PIN)
2. Cash Management → confirm **Shift open**
3. **Open POS**
4. Barcode scan / search / product tap
5. Customer select (agar khata / regular)
6. Discount agar allowed
7. **Pay Now** — Cash / JazzCash / EasyPaisa / Card / Split
8. Receipt print / WhatsApp
9. Next customer
10. Shift end par **Close shift** — drawer count vs expected cash

Manager extra: restock POs, expiry check, khata collection, expenses, reports.

---

## 6. Data & architecture (developers)

Frontend-only. Koi live backend nahi.

| File | Role |
| --- | --- |
| `lib/types.ts` | Domain types (Product, Sale, Customer, PO, …) |
| `lib/mock/seed.ts` | Demo products, employees, sales, charts |
| `lib/store/app-store.ts` | Products, sales, inventory, customers, register |
| `lib/store/pos-store.ts` | Live cart |
| `lib/store/ui-store.ts` | Sidebar, mobile nav, command palette |
| `app/(main)/` | Authenticated screens |
| `app/login/` | PIN login |
| `components/pos/` | Checkout, cart, payment, receipt |
| `components/layout/` | Shell, sidebar, header |

Zustand stores **persist nahi** hote (page refresh = seed data wapas).

API lagani ho to `lib/store/app-store.ts` ke actions ko HTTP calls se replace karein; UI screens same rehein.

---

## 7. Important notes

- Yeh **production-quality frontend demo** hai, live payment gateway nahi.
- JazzCash / EasyPaisa / WhatsApp / Email / PDF **UI + toast** hain.
- Tax default **0%** hai; Settings se change ho sakta hai.
- Print browser print dialog use karta hai.
- `node_modules` aur `.next` git mein nahi jate.

---

## 8. Screens map

| URL | Screen |
| --- | --- |
| `/login` | PIN login |
| `/` | Dashboard |
| `/pos` | Checkout |
| `/sales` | Sales history |
| `/sales/[id]` | Invoice |
| `/products` | Catalog |
| `/products/new` | Add product |
| `/products/[id]` | Edit product |
| `/products/barcodes` | Label print |
| `/categories` | Categories |
| `/inventory` | Stock |
| `/inventory/expiry` | Expiry |
| `/purchase-orders` | POs |
| `/purchase-orders/new` | Create PO |
| `/suppliers` | Suppliers |
| `/suppliers/[id]` | Supplier profile |
| `/customers` | Customers |
| `/customers/[id]` | Customer profile |
| `/customers/khata` | Udhaar ledger |
| `/returns` | Returns |
| `/expenses` | Expenses |
| `/cash` | Cash register |
| `/reports` | Reports |
| `/employees` | Staff + PIN |
| `/settings` | Store settings |
