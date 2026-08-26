# Next.js Modern Mart POS --- Complete Frontend Prompt

Build a **complete, production-quality, modern Point of Sale (POS)
frontend application** for a **Pakistani Mart / Grocery Store /
Supermarket**.

The application should feel like a premium commercial POS product ---
fast, clean, modern, minimal, responsive, and extremely easy for
cashiers and store managers to use.

## Tech Stack

Use: - Next.js 16+ with App Router - React - TypeScript - Tailwind CSS -
shadcn/ui - Lucide React icons - Recharts for analytics - Zustand for
frontend/global POS state where needed - React Hook Form + Zod for forms
and validation - Framer Motion only for subtle animations - date-fns -
Sonner for toast notifications

Use reusable components and maintain a clean scalable folder structure.

Do NOT build an outdated Bootstrap-style admin dashboard.

The UI should look like a modern SaaS/POS application similar in quality
to Shopify POS, Square, Stripe Dashboard, Linear, or modern inventory
management software.

## Design System

Create a premium visual design.

Style: - Modern - Clean - Professional - Minimal - Fast -
Retail-friendly - Soft rounded corners - Excellent spacing - Subtle
shadows - Clear typography - Beautiful empty states - Smooth hover
states - Skeleton loading states - Modern dialogs/drawers - Clean
tables - Large touch-friendly POS buttons

Use mostly: - White / very light gray backgrounds - Dark text - Soft
neutral borders - One professional primary accent color - Green for
success - Red for destructive actions - Amber for warnings

Support Light Mode and Dark Mode.

Currency throughout the system: **PKR / Rs.**

Use Pakistani formatting examples: - Rs. 1,250 - Rs. 15,500 - Rs.
125,000

## Application Structure

Create a collapsible modern sidebar with: - Dashboard - POS - Sales -
Products - Categories - Inventory - Purchase Orders - Suppliers -
Customers - Returns - Expenses - Cash Management - Reports - Employees -
Settings

At the bottom show logged-in employee, store name, settings, and logout.
Add keyboard-friendly navigation.

## 1. Dashboard

Create a beautiful business dashboard.

Top header: **Good Morning, Ali 👋**

Show current date, store status, current shift, and notification icon.

Top KPI cards: - Today's Sales - Today's Profit - Total Orders - Average
Order Value - Cash Sales - Card/Online Sales

Example: **Today's Sales --- Rs. 184,500 --- +12.5% vs yesterday**

Add: - Sales Overview line/area chart with Today, 7 Days, 30 Days, 3
Months, 1 Year - Sales vs Profit comparison - Payment Methods donut
chart: Cash, Card, Bank Transfer, JazzCash, EasyPaisa, Credit - Top
Selling Products: Product, Units Sold, Revenue, Profit - Low Stock
Alerts: Product Name, Available Quantity, Minimum Quantity, Status,
Restock button - Recent Sales: Invoice #, Customer, Cashier, Items,
Payment Method, Total, Date/Time - Business Statistics: Total Products,
Total Inventory Value, Customers, Suppliers, Outstanding Customer
Credit, Outstanding Supplier Payments

## 2. Main POS / Checkout Screen

This is the most important screen. Design it specifically for very fast
cashier operation using a two-panel layout.

### Left Side --- Products

Top search bar: **Search product, SKU or scan barcode...**

Add barcode scanner icon.

Search should support product name, SKU, barcode, and category.

Category tabs: - All - Grocery - Beverages - Snacks - Dairy - Frozen -
Bakery - Household - Personal Care - Other

Allow horizontal scrolling.

Show products in a grid. Each product card: - Product Image - Product
Name - Selling Price - Available Stock - Unit

Example: **Nestlé Milk 1L --- Rs. 320 --- 24 in stock**

Clicking a product immediately adds it to cart.

If a product has variants, show a variant selection popup.

Example Coca Cola variants: 250ml, 500ml, 1L, 1.5L, 2.25L.

Support units: Piece, Pack, Box, Carton, KG, Gram, Liter, ML.

## 3. POS Cart Panel

Right side contains the active transaction.

Header: Current Sale + cart item count.

Each cart item: - Product - Variant - Quantity - Unit Price - Discount -
Total

Allow increase/decrease quantity, manually typed quantity, remove item,
item discount, and price change with permission.

For weight-based products allow decimal quantities such as 0.25 KG, 0.5
KG, and 1.75 KG.

### Cart Summary

Show: - Subtotal - Item Discount - Order Discount - Tax - Previous
Balance / Customer Credit - Round Off - Grand Total

Make Grand Total large and visually prominent.

Buttons: - Hold Sale - Discount - Customer - Clear - Pay Now

**Pay Now** should be the primary large CTA.

## 4. Payment Modal

When Pay Now is clicked, show a polished payment dialog/drawer.

Payment methods: - Cash - Card - Bank Transfer - EasyPaisa - JazzCash -
Customer Credit - Split Payment

For Cash, show Amount Received and automatically calculate Change.

Quick cash buttons: - Exact - Rs. 500 - Rs. 1,000 - Rs. 2,000 - Rs.
5,000 - Rs. 10,000

For digital payments, show an optional transaction/reference number.

Support split payments, e.g. Cash Rs. 3,000 + JazzCash Rs. 1,850.

After completion show Payment Successful, invoice number, and options: -
Print Receipt - Download Receipt - WhatsApp Receipt - Email Receipt -
New Sale

## 5. Hold / Suspended Sales

Cashier can hold a cart.

Show Hold #, customer, total, item count, and actions: - Resume -
Delete - View

## 6. Products Management

Modern data table columns: - Image - Product - SKU - Barcode -
Category - Purchase Price - Selling Price - Stock - Unit - Supplier -
Status - Actions

Actions: View, Edit, Duplicate, Adjust Stock, Print Barcode, Delete.

Add search and filters for category, stock, supplier, and status.

Buttons: Add Product, Import CSV, Export CSV, Print Barcodes.

## 7. Add Product

Create a polished multi-section form.

Basic Information: - Product Name - Description - Category - Brand -
SKU - Barcode - Generate SKU - Generate Barcode

Pricing: - Purchase Price - Selling Price - Wholesale Price - Minimum
Selling Price - Auto-calculate Profit Amount and Profit Margin %

Inventory: - Opening Stock - Minimum Stock Level - Maximum Stock -
Unit - Supplier

Expiry: - Manufacturing Date - Expiry Date - Optional Batch Number

Add Product Image upload.

Support variants where each variant gets its own SKU, barcode, purchase
price, selling price, and stock.

## 8. Barcode Management

Allow product selection, label quantity, barcode size, product name,
selling price, and SKU.

Generate printable barcode sheet preview and allow printing multiple
labels.

## 9. Inventory

Dashboard cards: - Total Inventory Value - Total Products - Low Stock -
Out of Stock - Expiring Soon

Inventory table: - Product - SKU - Category - Available - Reserved -
Minimum Stock - Purchase Price - Inventory Value - Status

Statuses: In Stock, Low Stock, Out of Stock, Overstock.

Actions: Stock In, Stock Out, Adjustment, Transfer, History.

## 10. Stock Adjustment

Adjustment types: - Stock In - Stock Out - Damage - Expired - Lost -
Correction - Personal Use - Other

Fields: Product, Current Stock, Quantity, Reason, Notes.

Store full inventory movement history.

## 11. Expiry Management

Create an expiry dashboard with filters: - Expired - 7 Days - 30 Days -
60 Days - 90 Days

Columns: - Product - Batch - Quantity - Expiry Date - Days Remaining -
Stock Value - Status

Use color-coded warnings.

## 12. Purchase / Restocking

Purchase Orders page and Create Purchase Order flow.

Fields: - Supplier - PO Number - Date - Expected Delivery - Products -
Quantity - Purchase Cost - Tax - Discount

Statuses: Draft, Ordered, Partially Received, Received, Cancelled.

Allow receiving inventory against PO.

## 13. Suppliers

Supplier information: - Supplier Name - Company - Phone - WhatsApp -
Email - Address - NTN - Total Purchases - Outstanding Balance

Supplier profile: - Contact Information - Purchases - Payments -
Outstanding Balance - Purchase History - Products Supplied

Buttons: Create Purchase Order, Record Payment.

## 14. Customers

Fields: - Customer Name - Phone - WhatsApp - Email - Address

Customer types: Walk-in, Regular, Wholesale, VIP.

Show Total Purchases, Total Orders, Average Order, Credit Balance,
Loyalty Points.

Customer profile: Purchase History, Returns, Credit Ledger, Payments,
Notes.

At POS allow searching by name or phone number. Default customer:
**Walk-in Customer**.

## 15. Customer Credit / Khata

Build a complete Pakistani digital Khata / Udhaar system.

Show: - Customer - Phone - Total Credit - Amount Paid - Outstanding
Balance - Last Payment - Status

Customer Ledger: - Date - Invoice - Description - Debit - Credit -
Balance

Allow: - Give Credit - Record Payment - Add Note - Print Statement -
WhatsApp Statement

Statuses: Paid, Partial, Due, Overdue.

## 16. Sales

Sales history columns: - Invoice - Date - Customer - Cashier - Items -
Subtotal - Discount - Payment Method - Total - Status

Filters: Today, Yesterday, 7 Days, 30 Days, Custom Date, Payment Method,
Cashier, Customer.

Actions: View, Print, Download PDF, WhatsApp, Return, Void.

## 17. Sale Details

Professional invoice detail view with store information, invoice number,
date, cashier, customer, products, quantities, rates, discounts, totals,
payment information, and transaction reference.

Buttons: Print Receipt, Download, WhatsApp, Return Item, Void Sale.

## 18. Returns / Refunds

Search by invoice number, barcode, or customer.

Select returned products and quantity.

Reasons: - Damaged - Wrong Product - Expired - Customer Changed Mind -
Other

Refund methods: - Cash - Store Credit - Original Payment Method

Show return history.

## 19. Expense Management

Categories: - Rent - Electricity - Gas - Internet - Salary - Transport -
Maintenance - Food - Supplies - Miscellaneous

Add Expense fields: Title, Category, Amount, Date, Payment Method,
Description, Receipt Upload.

Show monthly expense analytics.

## 20. Cash Register / Cash Management

Open Shift: - Opening Cash - Cashier - Date/Time

During shift: - Opening Balance - Cash Sales - Cash Refunds - Cash In -
Cash Out - Expected Cash

Cash In / Cash Out examples: Petty Expense, Owner Withdrawal, Supplier
Payment, Cash Deposit.

Close Shift: - Expected Cash - Actual Cash - Automatically calculate
Difference - Show Short, Exact, or Over - Require notes when a
difference exists

## 21. Employee / Cashier Management

Fields: Name, Phone, Role, PIN, Status.

Roles: - Owner - Admin - Manager - Cashier - Inventory Manager

Permissions: - Can Apply Discount - Can Change Product Price - Can
Delete Sale - Can Void Invoice - Can Issue Refund - Can View Profit -
Can Manage Inventory - Can Manage Expenses - Can View Reports - Can
Manage Employees

Support quick PIN login for cashiers.

## 22. Reports

Reports: - Sales Report - Profit Report - Product Sales - Category
Sales - Inventory Report - Stock Movement - Purchase Report - Supplier
Report - Customer Report - Credit / Khata Report - Expense Report - Cash
Register Report - Tax Report - Employee Performance

Filters: Today, Yesterday, This Week, This Month, Last Month, This Year,
Custom Range.

Allow Export CSV, Export Excel, Download PDF, and Print.

## 23. Sales Report

Show Gross Sales, Net Sales, Profit, Orders, Items Sold, Average Order.

Charts by Hour, Day, Month.

## 24. Profit Report

Visually calculate: **Sales Revenue - Cost of Goods Sold = Gross
Profit - Expenses = Net Profit**

Show comparison with previous period.

## 25. Product Performance

Show: - Best Selling Products - Least Selling Products - Most Profitable
Products - Slow Moving Products - Out of Stock Products

Include charts and tables.

## 26. Store Settings

Sections: - Store Information - POS Settings - Receipt Settings - Tax
Settings - Payment Methods - Inventory Settings - Barcode Settings -
Users & Permissions - Backup - Notifications

Store Information: Store Name, Logo, Phone, WhatsApp, Email, Address,
NTN, STRN.

## 27. Receipt Settings

Receipt preview with toggles: - Store Logo - Store Address - Phone -
NTN - Cashier - Customer - Barcode - Tax - Discount - Footer Message

Example footer: **Thank you for shopping with us!**

Receipt sizes: 58mm, 80mm, A4.

## 28. Payment Methods

Manage: - Cash - Debit/Credit Card - Bank Transfer - EasyPaisa -
JazzCash - Customer Credit

Allow enabling/disabling methods.

## 29. Notifications

Notification center examples: - Low stock alerts - Out-of-stock alerts -
Products expiring soon - Customer credit overdue - Supplier payment
due - Large discount applied - Cash register difference

## 30. Global Search

Create **CTRL + K** command/search palette.

Search Products, Customers, Invoices, Suppliers, and Pages.

## 31. Keyboard Shortcuts

Optimize for cashier keyboard operation: - F1 = Search Product - F2 =
Customer - F4 = Hold Sale - F6 = Discount - F8 = Payment - F9 = Cash
Payment - F10 = Complete Sale - ESC = Close Dialog

Display shortcuts in POS where useful.

## 32. Responsiveness

Primary targets: - Desktop POS computer: 1366×768 - Desktop: 1920×1080 -
Laptop - Tablet

Mobile dashboard should remain usable, but POS checkout should
prioritize desktop/tablet layouts.

## 33. Empty States

Create polished empty states such as: - No sales yet - No low-stock
products 🎉 - No customers found

Do not leave blank tables.

## 34. Loading States

Use skeleton cards, skeleton tables, button loading indicators, and
optimistic UI where appropriate.

Avoid ugly full-page loading spinners.

## 35. Confirmation Dialogs

Use confirmation dialogs for: - Delete Product - Void Sale - Delete
Customer - Cancel Purchase - Clear Cart - Close Shift

Never use browser alert() or confirm().

## 36. Toasts

Use Sonner notifications such as: - Product added to cart - Sale
completed successfully - Product updated - Inventory adjusted - Customer
payment recorded

## 37. Sample Data

Populate frontend with realistic Pakistani mart data.

Products: - Coca Cola 1.5L - Pepsi 1.5L - Nestlé Milk 1L - Surf Excel
1KG - Tapal Danedar - Dalda Cooking Oil - National Salt - Shan Masala -
LU Biscuits - Lays - Nestlé Water - Colgate Toothpaste - Lifebuoy Soap -
Dettol - Everyday Milk Powder

Prices must use PKR. Use realistic Pakistani names for customers,
suppliers, and cashiers. Do NOT use lorem ipsum everywhere.

## 38. Frontend Architecture

Use reusable components: - AppSidebar - TopHeader - StatCard -
DataTable - FilterBar - SearchInput - ProductCard - POSCart - CartItem -
PaymentDialog - CustomerSelector - ProductSelector - BarcodeDialog -
ReceiptPreview - DateRangePicker - ExportMenu - StatusBadge -
ConfirmDialog - EmptyState - ChartCard

Keep components modular. Do not put entire pages into one 1000-line
component.

## 39. Demo Functionality

Although this phase is frontend-focused, make all functionality behave
realistically using mocked/local data.

I should be able to: - Add products to cart - Increase/decrease
quantity - Remove items - Apply discounts - Select customers - Calculate
totals - Accept mocked payments - Calculate cash change - Hold/resume
sales - Search products - Filter tables - Add/edit mock products - View
invoices - Create purchase orders - Adjust stock - Create expenses -
View reports - Switch dark/light mode

Use a clean mock service/data layer so APIs can easily replace mock data
later.

Do not scatter hardcoded demo data throughout UI components.

## 40. Database-Ready Data Models

Structure TypeScript interfaces so backend/database integration can
easily support: - users - employees - stores - products -
product_variants - categories - suppliers - customers - sales -
sale_items - payments - returns - return_items - inventory_movements -
purchase_orders - purchase_order_items - expenses - cash_registers -
customer_ledger - supplier_ledger - notifications - audit_logs

## Important UX Requirements

The application must feel extremely fast.

Cashiers should be able to complete a normal transaction within seconds.

Prioritize: - Minimum clicks - Large click areas - Keyboard shortcuts -
Barcode-first workflow - Immediate cart updates - Clear totals - Quick
payment - Fast search

Avoid unnecessary forms or navigation during checkout.

## Final Requirement

Build the project page-by-page with production-quality UI.

Do not create placeholder pages saying "Coming Soon".

Every sidebar page must contain a realistic and polished frontend
implementation.

Use consistent styling throughout the entire application.

Make it look like a **real premium POS SaaS product that could be sold
commercially to Pakistani marts and supermarkets**, not a university
project or generic admin dashboard.

Start by creating: 1. Complete application layout 2. Sidebar/navigation
3. Dashboard 4. Main POS checkout screen 5. Products & Inventory 6.
Sales 7. Customers / Khata 8. Suppliers / Purchases 9. Expenses 10.
Reports 11. Employees 12. Settings

Then connect all frontend flows using mock data and state management.

Pay special attention to the **POS checkout screen**, because it is the
core of the entire product.
