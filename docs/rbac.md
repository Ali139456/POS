# RBAC

System roles are seeded with `organization_id` null: `SUPER_ADMIN`, `PARENT_ADMIN`, `WAREHOUSE_MANAGER`, `STORE_MANAGER`, `CASHIER`, `INVENTORY_MANAGER`, `ACCOUNTANT`, `AUDITOR`.

Permission codes live in `permissions` and are mirrored by `lib/domain/access.ts`.

Cashiers receive `products.view`, `sales.view`, `sales.create`, `sales.return`, and `inventory.view`. They do not receive `sales.cancel` or price-management permissions.

UI checks are hints. `has_permission` and server functions are the enforcement.
