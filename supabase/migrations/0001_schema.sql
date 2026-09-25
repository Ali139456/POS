-- Al-Noor POS: multi-tenant schema
-- Money: numeric(18,2). Quantity: numeric(18,3).
-- Inventory changes only through inventory_transactions.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tenancy
-- ---------------------------------------------------------------------------

create table organizations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('parent', 'child', 'standalone')),
  name text not null,
  legal_name text,
  phone text,
  email text,
  address text,
  city text,
  ntn text,
  strn text,
  currency_code text not null default 'PKR',
  timezone text not null default 'Asia/Karachi',
  invoice_prefix text not null default 'INV',
  tax_inclusive boolean not null default false,
  allow_negative_stock boolean not null default false,
  internal_transfer_pricing boolean not null default false,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table organization_relationships (
  id uuid primary key default gen_random_uuid(),
  parent_organization_id uuid not null references organizations(id),
  child_organization_id uuid not null references organizations(id),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  unique (child_organization_id),
  check (parent_organization_id <> child_organization_id)
);

create table locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  kind text not null check (kind in ('retail', 'warehouse')),
  name text not null,
  code text,
  address text,
  phone text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index locations_org_idx on locations (organization_id);

-- ---------------------------------------------------------------------------
-- Identity and access
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  avatar_url text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  code text not null,
  name text not null,
  is_system boolean not null default false,
  unique (organization_id, code)
);

create table permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null
);

create table role_permissions (
  role_id uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  organization_id uuid not null references organizations(id),
  role_id uuid not null references roles(id),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  unique (user_id, organization_id)
);

create table user_locations (
  user_id uuid not null references profiles(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  primary key (user_id, location_id)
);

create table devices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  location_id uuid not null references locations(id),
  name text not null,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------

create table categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  name text not null,
  parent_id uuid references categories(id),
  status text not null default 'active' check (status in ('active', 'inactive')),
  unique (organization_id, name)
);

create table brands (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  name text not null,
  unique (organization_id, name)
);

create table units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  code text not null,
  name text not null,
  unique (organization_id, code)
);

create table unit_conversions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  from_unit_id uuid not null references units(id),
  to_unit_id uuid not null references units(id),
  factor numeric(18,6) not null check (factor > 0),
  unique (organization_id, from_unit_id, to_unit_id),
  check (from_unit_id <> to_unit_id)
);

create table tax_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  name text not null,
  unique (organization_id, name)
);

create table tax_rates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  tax_category_id uuid not null references tax_categories(id),
  name text not null,
  rate_percent numeric(8,4) not null check (rate_percent >= 0),
  active boolean not null default true
);

create table products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  category_id uuid references categories(id),
  brand_id uuid references brands(id),
  tax_category_id uuid references tax_categories(id),
  name text not null,
  description text,
  base_unit_id uuid not null references units(id),
  track_expiry boolean not null default false,
  track_batch boolean not null default false,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  product_id uuid not null references products(id),
  name text not null,
  sku text not null,
  purchase_price numeric(18,2) not null check (purchase_price >= 0),
  sale_price numeric(18,2) not null check (sale_price >= 0),
  wholesale_price numeric(18,2) not null default 0 check (wholesale_price >= 0),
  min_sale_price numeric(18,2),
  reorder_quantity numeric(18,3) not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive')),
  unique (organization_id, sku)
);

create table product_barcodes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  variant_id uuid not null references product_variants(id) on delete cascade,
  barcode text not null,
  is_primary boolean not null default false,
  unique (organization_id, barcode)
);

create table location_stock_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  location_id uuid not null references locations(id),
  variant_id uuid not null references product_variants(id),
  minimum_stock numeric(18,3) not null default 0,
  reorder_quantity numeric(18,3) not null default 0,
  unique (location_id, variant_id)
);

-- ---------------------------------------------------------------------------
-- Inventory ledger
-- ---------------------------------------------------------------------------

create table inventory_balances (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  location_id uuid not null references locations(id),
  variant_id uuid not null references product_variants(id),
  batch_code text not null default '',
  expiry_date date,
  quantity numeric(18,3) not null default 0,
  unique (location_id, variant_id, batch_code)
);

create table inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  location_id uuid not null references locations(id),
  variant_id uuid not null references product_variants(id),
  batch_code text not null default '',
  movement_type text not null check (movement_type in (
    'PURCHASE', 'SALE', 'SALE_RETURN', 'PURCHASE_RETURN',
    'TRANSFER_OUT', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT',
    'DAMAGE', 'EXPIRY', 'OPENING_BALANCE'
  )),
  quantity_before numeric(18,3) not null,
  quantity_change numeric(18,3) not null,
  quantity_after numeric(18,3) not null,
  reference_type text,
  reference_id uuid,
  reason text,
  actor_id uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index inventory_tx_location_idx on inventory_transactions (location_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Parties
-- ---------------------------------------------------------------------------

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  name text not null,
  business_name text,
  phone text,
  email text,
  address text,
  ntn text,
  payment_terms text,
  opening_balance numeric(18,2) not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  kind text not null default 'registered' check (kind in ('walk_in', 'registered')),
  name text not null,
  phone text,
  email text,
  address text,
  ntn text,
  credit_limit numeric(18,2) not null default 0,
  opening_balance numeric(18,2) not null default 0,
  loyalty_points integer not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create table customer_ledger (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  customer_id uuid not null references customers(id),
  location_id uuid references locations(id),
  entry_type text not null check (entry_type in ('sale', 'payment', 'refund', 'adjustment', 'opening')),
  amount numeric(18,2) not null,
  reference_type text,
  reference_id uuid,
  note text,
  actor_id uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Purchasing
-- ---------------------------------------------------------------------------

create table purchase_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  location_id uuid not null references locations(id),
  supplier_id uuid not null references suppliers(id),
  number text not null,
  status text not null default 'draft' check (status in ('draft', 'ordered', 'partially_received', 'received', 'cancelled')),
  ordered_at date,
  expected_at date,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  unique (organization_id, number)
);

create table purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references purchase_orders(id) on delete cascade,
  variant_id uuid not null references product_variants(id),
  quantity numeric(18,3) not null check (quantity > 0),
  unit_cost numeric(18,2) not null check (unit_cost >= 0),
  received_quantity numeric(18,3) not null default 0
);

create table goods_receipts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  location_id uuid not null references locations(id),
  purchase_order_id uuid references purchase_orders(id),
  supplier_id uuid not null references suppliers(id),
  number text not null,
  received_at timestamptz not null default now(),
  received_by uuid references profiles(id),
  unique (organization_id, number)
);

create table goods_receipt_items (
  id uuid primary key default gen_random_uuid(),
  goods_receipt_id uuid not null references goods_receipts(id) on delete cascade,
  variant_id uuid not null references product_variants(id),
  quantity numeric(18,3) not null check (quantity > 0),
  unit_cost numeric(18,2) not null check (unit_cost >= 0),
  batch_code text not null default '',
  expiry_date date
);

create table purchase_invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  supplier_id uuid not null references suppliers(id),
  goods_receipt_id uuid references goods_receipts(id),
  invoice_number text not null,
  invoice_date date not null,
  subtotal numeric(18,2) not null,
  discount numeric(18,2) not null default 0,
  tax numeric(18,2) not null default 0,
  total numeric(18,2) not null,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'partial', 'paid')),
  unique (organization_id, supplier_id, invoice_number)
);

create table purchase_invoice_items (
  id uuid primary key default gen_random_uuid(),
  purchase_invoice_id uuid not null references purchase_invoices(id) on delete cascade,
  variant_id uuid not null references product_variants(id),
  quantity numeric(18,3) not null,
  unit_cost numeric(18,2) not null,
  tax numeric(18,2) not null default 0,
  line_total numeric(18,2) not null
);

-- ---------------------------------------------------------------------------
-- Sales
-- ---------------------------------------------------------------------------

create table sales (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  location_id uuid not null references locations(id),
  device_id uuid references devices(id),
  client_transaction_id uuid not null,
  number text not null,
  customer_id uuid references customers(id),
  cashier_id uuid references profiles(id),
  status text not null default 'completed' check (status in ('completed', 'voided')),
  subtotal numeric(18,2) not null,
  discount numeric(18,2) not null default 0,
  tax numeric(18,2) not null default 0,
  total numeric(18,2) not null,
  cost_total numeric(18,2) not null default 0,
  sold_at timestamptz not null default now(),
  unique (device_id, client_transaction_id),
  unique (organization_id, number)
);

create table sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  variant_id uuid not null references product_variants(id),
  quantity numeric(18,3) not null check (quantity > 0),
  unit_price numeric(18,2) not null,
  discount numeric(18,2) not null default 0,
  tax numeric(18,2) not null default 0,
  line_total numeric(18,2) not null,
  unit_cost numeric(18,2) not null default 0,
  batch_code text not null default ''
);

create table sale_payments (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  method text not null check (method in ('cash', 'card', 'bank_transfer', 'jazzcash', 'easypaisa', 'customer_credit', 'other')),
  amount numeric(18,2) not null check (amount >= 0),
  reference text
);

create table sale_returns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  location_id uuid not null references locations(id),
  sale_id uuid not null references sales(id),
  number text not null,
  reason text not null,
  refund_method text not null check (refund_method in ('cash', 'store_credit', 'original')),
  total numeric(18,2) not null,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  unique (organization_id, number)
);

create table sale_return_items (
  id uuid primary key default gen_random_uuid(),
  sale_return_id uuid not null references sale_returns(id) on delete cascade,
  sale_item_id uuid not null references sale_items(id),
  quantity numeric(18,3) not null check (quantity > 0),
  line_total numeric(18,2) not null
);

-- ---------------------------------------------------------------------------
-- Internal stock movement
-- ---------------------------------------------------------------------------

create table stock_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  requesting_location_id uuid not null references locations(id),
  source_location_id uuid references locations(id),
  number text not null,
  status text not null default 'draft' check (status in (
    'draft', 'pending', 'approved', 'partially_approved', 'rejected',
    'dispatched', 'partially_received', 'received', 'cancelled'
  )),
  requested_by uuid references profiles(id),
  reviewed_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  unique (organization_id, number)
);

create table stock_request_items (
  id uuid primary key default gen_random_uuid(),
  stock_request_id uuid not null references stock_requests(id) on delete cascade,
  variant_id uuid not null references product_variants(id),
  requested_quantity numeric(18,3) not null check (requested_quantity > 0),
  approved_quantity numeric(18,3)
);

create table stock_transfers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  stock_request_id uuid references stock_requests(id),
  source_location_id uuid not null references locations(id),
  destination_location_id uuid not null references locations(id),
  number text not null,
  status text not null default 'draft' check (status in ('draft', 'dispatched', 'partially_received', 'received', 'cancelled')),
  requested_by uuid references profiles(id),
  approved_by uuid references profiles(id),
  dispatched_by uuid references profiles(id),
  received_by uuid references profiles(id),
  dispatched_at timestamptz,
  received_at timestamptz,
  internal_price_enabled boolean not null default false,
  unique (organization_id, number),
  check (source_location_id <> destination_location_id)
);

create table stock_transfer_items (
  id uuid primary key default gen_random_uuid(),
  stock_transfer_id uuid not null references stock_transfers(id) on delete cascade,
  variant_id uuid not null references product_variants(id),
  quantity numeric(18,3) not null check (quantity > 0),
  received_quantity numeric(18,3) not null default 0,
  internal_unit_price numeric(18,2)
);

-- ---------------------------------------------------------------------------
-- Expenses, cash, tax submissions, audit
-- ---------------------------------------------------------------------------

create table expense_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  name text not null,
  unique (organization_id, name)
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  location_id uuid not null references locations(id),
  category_id uuid not null references expense_categories(id),
  title text not null,
  amount numeric(18,2) not null check (amount >= 0),
  spent_on date not null,
  payment_method text not null,
  affects_register boolean not null default false,
  register_session_id uuid,
  note text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table cash_registers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  location_id uuid not null references locations(id),
  name text not null
);

create table register_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  register_id uuid not null references cash_registers(id),
  location_id uuid not null references locations(id),
  opened_by uuid references profiles(id),
  closed_by uuid references profiles(id),
  opening_cash numeric(18,2) not null,
  expected_cash numeric(18,2),
  actual_cash numeric(18,2),
  difference numeric(18,2),
  status text not null default 'open' check (status in ('open', 'closed')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  notes text
);

alter table expenses
  add constraint expenses_register_session_fk
  foreign key (register_session_id) references register_sessions(id);

create table cash_movements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  register_session_id uuid not null references register_sessions(id),
  movement_type text not null check (movement_type in ('sale', 'refund', 'cash_in', 'cash_out', 'expense')),
  amount numeric(18,2) not null,
  reason text,
  actor_id uuid references profiles(id),
  reference_type text,
  reference_id uuid,
  created_at timestamptz not null default now()
);

create table fbr_submissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  sale_id uuid not null references sales(id),
  status text not null check (status in ('FBR_PENDING', 'FBR_SUBMITTED', 'FBR_ACCEPTED', 'FBR_REJECTED', 'FBR_FAILED')),
  provider text not null,
  request_payload jsonb,
  response_payload jsonb,
  reference_number text,
  attempts integer not null default 0,
  next_attempt_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  location_id uuid references locations(id),
  actor_id uuid references profiles(id),
  action text not null,
  entity text not null,
  entity_id uuid,
  before jsonb,
  after jsonb,
  ip inet,
  device_meta jsonb,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  location_id uuid references locations(id),
  user_id uuid references profiles(id),
  kind text not null,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Secrets never selected by the browser role. Written only by service functions.
create table organization_secrets (
  organization_id uuid primary key references organizations(id),
  fbr_credentials jsonb,
  updated_at timestamptz not null default now()
);

revoke all on organization_secrets from anon, authenticated;
