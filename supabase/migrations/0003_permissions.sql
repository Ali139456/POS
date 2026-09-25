-- System permissions and roles. organization_id null means a platform template.
-- Copy onto an organization when that organization is created.

insert into permissions (code, description) values
  ('products.view', 'View products'),
  ('products.create', 'Create products'),
  ('products.update', 'Update products'),
  ('products.delete', 'Delete products'),
  ('inventory.view', 'View inventory'),
  ('inventory.adjust', 'Adjust inventory'),
  ('inventory.transfer', 'Transfer inventory'),
  ('inventory.receive', 'Receive inventory'),
  ('sales.view', 'View sales'),
  ('sales.create', 'Create sales'),
  ('sales.return', 'Return sales'),
  ('sales.cancel', 'Cancel sales'),
  ('purchases.view', 'View purchases'),
  ('purchases.create', 'Create purchases'),
  ('purchases.approve', 'Approve purchases'),
  ('reports.view', 'View reports'),
  ('reports.export', 'Export reports'),
  ('users.view', 'View users'),
  ('users.manage', 'Manage users'),
  ('settings.manage', 'Manage settings'),
  ('fbr.manage', 'Manage FBR'),
  ('audit.view', 'View audit logs')
on conflict (code) do nothing;

insert into roles (organization_id, code, name, is_system) values
  (null, 'SUPER_ADMIN', 'Super admin', true),
  (null, 'PARENT_ADMIN', 'Parent admin', true),
  (null, 'WAREHOUSE_MANAGER', 'Warehouse manager', true),
  (null, 'STORE_MANAGER', 'Store manager', true),
  (null, 'CASHIER', 'Cashier', true),
  (null, 'INVENTORY_MANAGER', 'Inventory manager', true),
  (null, 'ACCOUNTANT', 'Accountant', true),
  (null, 'AUDITOR', 'Auditor', true)
on conflict do nothing;

-- Template roles use a partial unique index because organization_id is null.
create unique index if not exists roles_system_code_idx on roles (code) where organization_id is null;

insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r
join permissions p on r.organization_id is null and (
  r.code in ('SUPER_ADMIN', 'PARENT_ADMIN')
  or (r.code = 'WAREHOUSE_MANAGER' and p.code in (
    'products.view', 'inventory.view', 'inventory.adjust', 'inventory.transfer', 'inventory.receive',
    'purchases.view', 'purchases.create', 'reports.view'
  ))
  or (r.code = 'STORE_MANAGER' and p.code not in ('fbr.manage'))
  or (r.code = 'CASHIER' and p.code in ('products.view', 'sales.view', 'sales.create', 'sales.return', 'inventory.view'))
  or (r.code = 'INVENTORY_MANAGER' and p.code in (
    'products.view', 'products.create', 'products.update',
    'inventory.view', 'inventory.adjust', 'inventory.transfer', 'inventory.receive',
    'purchases.view', 'purchases.create', 'reports.view'
  ))
  or (r.code = 'ACCOUNTANT' and p.code in (
    'sales.view', 'purchases.view', 'reports.view', 'reports.export', 'audit.view'
  ))
  or (r.code = 'AUDITOR' and p.code in (
    'products.view', 'inventory.view', 'sales.view', 'purchases.view', 'reports.view', 'audit.view'
  ))
);
