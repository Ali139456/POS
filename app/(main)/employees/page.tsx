"use client";

import { useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { AvatarHue } from "@/components/shared/thumbs";
import { useAppStore } from "@/lib/store/app-store";
import { uid } from "@/lib/utils";
import type { Employee, EmployeeRole, PermissionSet } from "@/lib/types";
import { toast } from "sonner";

const ROLES: EmployeeRole[] = ["Owner", "Admin", "Manager", "Cashier", "Inventory Manager"];
const PERM_KEYS: { key: keyof PermissionSet; label: string }[] = [
  { key: "canApplyDiscount", label: "Can Apply Discount" },
  { key: "canChangeProductPrice", label: "Can Change Product Price" },
  { key: "canDeleteSale", label: "Can Delete Sale" },
  { key: "canVoidInvoice", label: "Can Void Invoice" },
  { key: "canIssueRefund", label: "Can Issue Refund" },
  { key: "canViewProfit", label: "Can View Profit" },
  { key: "canManageInventory", label: "Can Manage Inventory" },
  { key: "canManageExpenses", label: "Can Manage Expenses" },
  { key: "canViewReports", label: "Can View Reports" },
  { key: "canManageEmployees", label: "Can Manage Employees" },
];

export default function EmployeesPage() {
  const employees = useAppStore((s) => s.employees);
  const upsert = useAppStore((s) => s.upsertEmployee);
  const setCurrent = useAppStore((s) => s.setCurrentEmployee);
  const [edit, setEdit] = useState<Employee | null>(null);

  return (
    <>
      <TopHeader title="Employees" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader
          title="Employees & cashiers"
          description="PIN login and role permissions"
          actions={
            <Button
              onClick={() =>
                setEdit({
                  id: uid("emp"),
                  name: "",
                  phone: "",
                  role: "Cashier",
                  pin: "0000",
                  status: "Active",
                  permissions: {
                    canApplyDiscount: true,
                    canChangeProductPrice: false,
                    canDeleteSale: false,
                    canVoidInvoice: false,
                    canIssueRefund: false,
                    canViewProfit: false,
                    canManageInventory: false,
                    canManageExpenses: false,
                    canViewReports: false,
                    canManageEmployees: false,
                  },
                  avatarHue: Math.floor(Math.random() * 360),
                })
              }
            >
              Add employee
            </Button>
          }
        />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {employees.map((e) => (
            <Card key={e.id} className="flex min-w-0 flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <AvatarHue name={e.name} hue={e.avatarHue} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{e.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {e.role} · {e.phone} · PIN {e.pin}
                </p>
                <StatusBadge status={e.status} />
              </div>
          <div className="flex min-h-11 shrink-0 gap-2 sm:flex-col">
                <Button size="sm" variant="outline" onClick={() => setEdit(e)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setCurrent(e.id); toast.success(`Signed in as ${e.name}`); }}>
                  Switch
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Dialog open={!!edit} onClose={() => setEdit(null)} title={edit?.name ? "Edit employee" : "New employee"} wide>
        {edit && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input className="mt-1" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input className="mt-1" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} />
              </div>
              <div>
                <Label>Role</Label>
                <Select className="mt-1" value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value as EmployeeRole })}>
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>PIN</Label>
                <Input className="mt-1" value={edit.pin} onChange={(e) => setEdit({ ...edit, pin: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {PERM_KEYS.map((p) => (
            <label key={p.key} className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={edit.permissions[p.key]}
                    onChange={(e) => setEdit({ ...edit, permissions: { ...edit.permissions, [p.key]: e.target.checked } })}
                  />
                  {p.label}
                </label>
              ))}
            </div>
            <Button
              className="w-full"
              onClick={() => {
                upsert(edit);
                toast.success("Employee saved");
                setEdit(null);
              }}
            >
              Save
            </Button>
          </div>
        )}
      </Dialog>
    </>
  );
}
