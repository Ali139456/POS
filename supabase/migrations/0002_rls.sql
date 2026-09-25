-- Row Level Security. Frontend organization_id is never trusted.
-- Child members see only their organizations.
-- Parent members can read linked child organizations.
-- organization_secrets has no policy for authenticated users.

create or replace function visible_organization_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.organization_id
  from memberships m
  where m.user_id = auth.uid() and m.status = 'active'
  union
  select r.child_organization_id
  from organization_relationships r
  join memberships m on m.organization_id = r.parent_organization_id
  where m.user_id = auth.uid()
    and m.status = 'active'
    and r.status = 'active'
$$;

create or replace function member_organization_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from memberships
  where user_id = auth.uid() and status = 'active'
$$;

create or replace function has_permission(permission_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from memberships m
    join role_permissions rp on rp.role_id = m.role_id
    join permissions p on p.id = rp.permission_id
    where m.user_id = auth.uid()
      and m.status = 'active'
      and p.code = permission_code
  )
$$;

create or replace function can_access_location(target_location uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from locations l
    where l.id = target_location
      and l.organization_id in (select visible_organization_ids())
      and (
        not exists (select 1 from user_locations ul where ul.user_id = auth.uid())
        or l.id in (select ul.location_id from user_locations ul where ul.user_id = auth.uid())
        or l.organization_id not in (select member_organization_ids())
      )
  )
$$;

alter table organizations enable row level security;
alter table organization_relationships enable row level security;
alter table locations enable row level security;
alter table profiles enable row level security;
alter table roles enable row level security;
alter table permissions enable row level security;
alter table role_permissions enable row level security;
alter table memberships enable row level security;
alter table user_locations enable row level security;
alter table devices enable row level security;
alter table categories enable row level security;
alter table brands enable row level security;
alter table units enable row level security;
alter table unit_conversions enable row level security;
alter table tax_categories enable row level security;
alter table tax_rates enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_barcodes enable row level security;
alter table location_stock_policies enable row level security;
alter table inventory_balances enable row level security;
alter table inventory_transactions enable row level security;
alter table suppliers enable row level security;
alter table customers enable row level security;
alter table customer_ledger enable row level security;
alter table purchase_orders enable row level security;
alter table purchase_order_items enable row level security;
alter table goods_receipts enable row level security;
alter table goods_receipt_items enable row level security;
alter table purchase_invoices enable row level security;
alter table purchase_invoice_items enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table sale_payments enable row level security;
alter table sale_returns enable row level security;
alter table sale_return_items enable row level security;
alter table stock_requests enable row level security;
alter table stock_request_items enable row level security;
alter table stock_transfers enable row level security;
alter table stock_transfer_items enable row level security;
alter table expense_categories enable row level security;
alter table expenses enable row level security;
alter table cash_registers enable row level security;
alter table register_sessions enable row level security;
alter table cash_movements enable row level security;
alter table fbr_submissions enable row level security;
alter table audit_logs enable row level security;
alter table notifications enable row level security;
alter table organization_secrets enable row level security;

-- Audit is append-only for authenticated users. No update or delete policy.
create policy audit_select on audit_logs for select to authenticated
  using (organization_id in (select visible_organization_ids()) and has_permission('audit.view'));
create policy audit_insert on audit_logs for insert to authenticated
  with check (organization_id in (select member_organization_ids()));

create policy org_select on organizations for select to authenticated
  using (id in (select visible_organization_ids()));

create policy rel_select on organization_relationships for select to authenticated
  using (
    parent_organization_id in (select member_organization_ids())
    or child_organization_id in (select member_organization_ids())
  );

create policy location_select on locations for select to authenticated
  using (can_access_location(id));

create policy profile_self on profiles for select to authenticated
  using (
    id = auth.uid()
    or id in (
      select m.user_id from memberships m
      where m.organization_id in (select visible_organization_ids())
    )
  );

create policy permissions_read on permissions for select to authenticated using (true);
create policy roles_read on roles for select to authenticated
  using (organization_id is null or organization_id in (select visible_organization_ids()));
create policy role_permissions_read on role_permissions for select to authenticated using (true);

create policy memberships_read on memberships for select to authenticated
  using (organization_id in (select visible_organization_ids()) or user_id = auth.uid());

create policy user_locations_read on user_locations for select to authenticated
  using (user_id = auth.uid() or can_access_location(location_id));

-- Tenant tables that carry organization_id: read if visible, write only inside own membership.
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'devices', 'categories', 'brands', 'units', 'unit_conversions',
    'tax_categories', 'tax_rates', 'products', 'product_variants', 'product_barcodes',
    'location_stock_policies', 'inventory_balances', 'inventory_transactions',
    'suppliers', 'customers', 'customer_ledger',
    'purchase_orders', 'goods_receipts', 'purchase_invoices',
    'sales', 'sale_returns', 'stock_requests', 'stock_transfers',
    'expense_categories', 'expenses', 'cash_registers', 'register_sessions',
    'cash_movements', 'fbr_submissions', 'notifications'
  ]
  loop
    execute format(
      'create policy %I on %I for select to authenticated using (organization_id in (select visible_organization_ids()))',
      tbl || '_select', tbl
    );
    execute format(
      'create policy %I on %I for insert to authenticated with check (organization_id in (select member_organization_ids()))',
      tbl || '_insert', tbl
    );
    execute format(
      'create policy %I on %I for update to authenticated using (organization_id in (select member_organization_ids())) with check (organization_id in (select member_organization_ids()))',
      tbl || '_update', tbl
    );
  end loop;
end $$;

-- Child line tables follow the parent document, which is already org-scoped.
create policy poi_select on purchase_order_items for select to authenticated
  using (purchase_order_id in (select id from purchase_orders));
create policy gri_select on goods_receipt_items for select to authenticated
  using (goods_receipt_id in (select id from goods_receipts));
create policy pii_select on purchase_invoice_items for select to authenticated
  using (purchase_invoice_id in (select id from purchase_invoices));
create policy si_select on sale_items for select to authenticated
  using (sale_id in (select id from sales));
create policy sp_select on sale_payments for select to authenticated
  using (sale_id in (select id from sales));
create policy sri_select on sale_return_items for select to authenticated
  using (sale_return_id in (select id from sale_returns));
create policy sriq_select on stock_request_items for select to authenticated
  using (stock_request_id in (select id from stock_requests));
create policy sti_select on stock_transfer_items for select to authenticated
  using (stock_transfer_id in (select id from stock_transfers));

-- Inventory ledger rows are not updated by clients.
revoke update, delete on inventory_transactions from authenticated;
revoke update, delete on audit_logs from authenticated;
