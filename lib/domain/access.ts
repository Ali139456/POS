export const PERMISSIONS = [
  "products.view",
  "products.create",
  "products.update",
  "products.delete",
  "inventory.view",
  "inventory.adjust",
  "inventory.transfer",
  "inventory.receive",
  "sales.view",
  "sales.create",
  "sales.return",
  "sales.cancel",
  "purchases.view",
  "purchases.create",
  "purchases.approve",
  "reports.view",
  "reports.export",
  "users.view",
  "users.manage",
  "settings.manage",
  "fbr.manage",
  "audit.view",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export function assertPermission(granted: ReadonlySet<string>, required: Permission): void {
  if (!granted.has(required)) throw new Error(`Missing permission ${required}`);
}

export function canSeeOrganization(
  viewerOrgIds: ReadonlySet<string>,
  childOrgIds: ReadonlySet<string>,
  targetOrgId: string,
): boolean {
  return viewerOrgIds.has(targetOrgId) || childOrgIds.has(targetOrgId);
}
