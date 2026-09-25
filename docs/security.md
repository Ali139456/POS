# Security

- Supabase Auth identifies the user. `auth.uid()` is the only identity RLS trusts.
- `visible_organization_ids()` is the user's organizations plus children of a parent membership.
- `member_organization_ids()` is the write scope. A parent can read a child. A parent does not gain a blanket write into the child through table policies.
- `has_permission(code)` checks the membership role.
- `can_access_location` applies `user_locations` when the user has assignments.
- Inventory balances cannot be updated by the `authenticated` role. Use `post_inventory_movement`.
- Audit logs have select and insert policies only.
- The service-role key stays on the server. It is not a `NEXT_PUBLIC_` variable.
- Sale totals must be recalculated on the server before insert. Client prices are not authority.

Register PIN, when added, is a hashed check for a shared terminal. It does not replace Auth.
