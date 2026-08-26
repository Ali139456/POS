"use client";

import { useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useAppStore } from "@/lib/store/app-store";
import { uid } from "@/lib/utils";
import { toast } from "sonner";

export default function CategoriesPage() {
  const categories = useAppStore((s) => s.categories);
  const upsert = useAppStore((s) => s.upsertCategory);
  const remove = useAppStore((s) => s.deleteCategory);
  const [name, setName] = useState("");
  const [del, setDel] = useState<string | null>(null);

  return (
    <>
      <TopHeader title="Categories" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader title="Categories" description="Organize the catalog for POS tabs" />
        <Card className="mt-4 flex flex-wrap gap-2 p-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" className="w-full sm:max-w-xs" />
          <Button
            onClick={() => {
              if (!name.trim()) return;
              upsert({
                id: uid("cat"),
                name: name.trim(),
                slug: name.trim().toLowerCase().replace(/\s+/g, "-"),
                color: "#0F766E",
                productCount: 0,
              });
              setName("");
              toast.success("Category added");
            }}
          >
            Add category
          </Button>
        </Card>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((c) => (
            <Card key={c.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="size-3 rounded-full" style={{ background: c.color }} />
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.productCount} products</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDel(c.id)}>
                Delete
              </Button>
            </Card>
          ))}
        </div>
      </div>
      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        title="Delete category?"
        description="Products in this category will keep their current assignment."
        destructive
        confirmLabel="Delete"
        onConfirm={() => del && remove(del)}
      />
    </>
  );
}
