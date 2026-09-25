"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store/app-store";
import { useOrgStore } from "@/lib/store/org-store";
import { toast } from "sonner";

export default function LoginPage() {
  const allEmployees = useAppStore((s) => s.employees);
  const employees = useMemo(() => allEmployees.filter((e) => e.status === "Active"), [allEmployees]);
  const setCurrent = useAppStore((s) => s.setCurrentEmployee);
  const [pin, setPin] = useState("");
  const [selected, setSelected] = useState(employees[0]?.id ?? "");
  const router = useRouter();

  function login(id?: string, code?: string) {
    const emp = employees.find((e) => e.id === (id ?? selected));
    if (!emp) return;
    if ((code ?? pin) !== emp.pin) {
      toast.error("Incorrect PIN");
      return;
    }
    setCurrent(emp.id);
    useOrgStore.getState().initContextForEmployee(emp.accessLevel, emp.organizationId);
    toast.success(`Welcome back, ${emp.name.split(" ")[0]}`);
    router.push("/");
  }

  return (
    <div className="flex min-h-dvh items-start justify-center overflow-y-auto bg-slate-950 p-3 sm:items-center sm:p-4">
      <div className="my-auto w-full max-w-md rounded-2xl bg-card p-5 shadow-2xl sm:rounded-3xl sm:p-8">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Store className="size-6" />
        </div>
        <h1 className="mt-3 text-center text-xl font-semibold sm:mt-4 sm:text-2xl">Al-Noor Super Mart</h1>
        <p className="text-center text-sm text-muted-foreground">Cashier PIN login</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6">
          {employees.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelected(e.id)}
              className={`min-h-11 rounded-xl border px-2.5 py-2.5 text-left text-sm sm:min-h-14 sm:px-3 sm:py-3 ${selected === e.id ? "border-primary bg-accent" : "border-border"}`}
            >
              <p className="truncate font-medium">{e.name}</p>
              <p className="truncate text-xs text-muted-foreground">{e.role}</p>
            </button>
          ))}
        </div>
        <Input
          className="mt-4 h-12 text-center text-lg tracking-[0.4em]"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="••••"
        />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "←", "0", "OK"].map((k) => (
            <Button
              key={k}
              variant={k === "OK" ? "default" : "secondary"}
              className="h-11 min-h-11 sm:h-12"
              onClick={() => {
                if (k === "←") setPin((p) => p.slice(0, -1));
                else if (k === "OK") login();
                else setPin((p) => (p + k).slice(0, 4));
              }}
            >
              {k}
            </Button>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">Demo PIN for Ali: 1234</p>
      </div>
    </div>
  );
}
