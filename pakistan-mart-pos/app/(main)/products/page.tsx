"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Barcode, Pencil, Copy, Trash2, Warehouse } from "lucide-react";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput, FilterBar } from "@/components/shared/search-input";
import { ExportMenu } from "@/components/shared/export-menu";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Card } from "@/components/ui/badge";
import { ProductThumb } from "@/components/shared/thumbs";
import { StatusBadge, StockBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/page-header";
import { useAppStore } from "@/lib/store/app-store";
import { formatPKR } from "@/lib/utils";
import { toast } from "sonner";
import type { Product } from "@/lib/types";

export default function ProductsPage() {
  const products = useAppStore((s) => s.products);
  const categories = useAppStore((s) => s.categories);
  const suppliers = useAppStore((s) => s.suppliers);
  const deleteProduct = useAppStore((s) => s.deleteProduct);
  const upsertProduct = useAppStore((s) => s.upsertProduct);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [stock, setStock] = useState("all");
  const [sup, setSup] = useState("all");
  const [status, setStatus] = useState("all");
  const [del, setDel] = useState<Product | null>(null);

  const rows = useMemo(() => {
    return products.filter((p) => {
      if (cat !== "all" && p.categoryId !== cat) return false;
      if (sup !== "all" && p.supplierId !== sup) return false;
      if (status !== "all" && p.status !== status) return false;
      if (stock === "low" && p.stock > p.minStock) return false;
      if (stock === "out" && p.stock > 0) return false;
      if (stock === "in" && p.stock <= 0) return false;
      const query = q.toLowerCase();
      if (query && !`${p.name} ${p.sku} ${p.barcode} ${p.brand}`.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [products, q, cat, stock, sup, status]);

  return (
    <>
      <TopHeader title="Products" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader
          title="Products"
          description="Catalog, pricing, barcodes and stock"
          actions={
            <>
              <Button variant="outline" size="sm" onClick={() => router.push("/products/barcodes")}>
                <Barcode className="size-4" /> Print Barcodes
              </Button>
              <ExportMenu
                filename="products"
                rows={rows.map((p) => ({
                  name: p.name,
                  sku: p.sku,
                  barcode: p.barcode,
                  price: p.sellingPrice,
                  stock: p.stock,
                }))}
              />
              <Button variant="outline" size="sm" onClick={() => toast.success("CSV import is ready for the API layer")}>
                Import CSV
              </Button>
              <Button size="sm" onClick={() => router.push("/products/new")}>
                <Plus className="size-4" /> Add Product
              </Button>
            </>
          }
        />
        <Card className="mt-4 p-4">
          <FilterBar>
            <SearchInput value={q} onChange={setQ} placeholder="Search name, SKU, barcode" className="w-full md:w-72" />
            <Select value={cat} onChange={(e) => setCat(e.target.value)} className="w-full md:w-40">
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select value={stock} onChange={(e) => setStock(e.target.value)} className="w-full md:w-36">
              <option value="all">All stock</option>
              <option value="in">In stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </Select>
            <Select value={sup} onChange={(e) => setSup(e.target.value)} className="w-full md:w-48">
              <option value="all">All suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.company}
                </option>
              ))}
            </Select>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full md:w-36">
              <option value="all">All status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </FilterBar>
          {rows.length === 0 ? (
            <div className="mt-6">
              <EmptyState title="No products found" description="Try a different filter or add a product." />
            </div>
          ) : (
            <>
            <div className="mt-4 space-y-2 md:hidden">
              {rows.map((p) => (
                <div key={p.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-start gap-3">
                    <ProductThumb product={p} size="sm" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/products/${p.id}`} className="line-clamp-2 font-medium">
                        {p.name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">{p.sku}</p>
                      <p className="mt-1 font-semibold text-primary">{formatPKR(p.sellingPrice)}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-xs">Stock {p.stock}</span>
                        <StockBadge stock={p.stock} min={p.minStock} max={p.maxStock} />
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => router.push(`/products/${p.id}`)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => router.push("/inventory")}>
                      Stock
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDel(p)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1100px] text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    {["", "Product", "SKU", "Barcode", "Category", "Purchase", "Selling", "Stock", "Unit", "Supplier", "Status", ""].map((h, i) => (
                      <th key={i} className="pb-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="py-2">
                        <ProductThumb product={p} size="sm" />
                      </td>
                      <td>
                        <Link href={`/products/${p.id}`} className="font-medium hover:text-primary">
                          {p.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{p.brand}</p>
                      </td>
                      <td className="font-mono text-xs">{p.sku}</td>
                      <td className="font-mono text-xs">{p.barcode}</td>
                      <td>{categories.find((c) => c.id === p.categoryId)?.name}</td>
                      <td>{formatPKR(p.purchasePrice)}</td>
                      <td className="font-medium">{formatPKR(p.sellingPrice)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {p.stock}
                          <StockBadge stock={p.stock} min={p.minStock} max={p.maxStock} />
                        </div>
                      </td>
                      <td>{p.unit}</td>
                      <td className="max-w-[140px] truncate">{suppliers.find((s) => s.id === p.supplierId)?.company}</td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <IconBtn onClick={() => router.push(`/products/${p.id}`)}><Pencil className="size-3.5" /></IconBtn>
                          <IconBtn
                            onClick={() => {
                              upsertProduct({ ...p, id: `${p.id}_copy`, name: `${p.name} (copy)`, sku: `${p.sku}-C` });
                              toast.success("Product duplicated");
                            }}
                          >
                            <Copy className="size-3.5" />
                          </IconBtn>
                          <IconBtn onClick={() => router.push(`/inventory?adjust=${p.id}`)}>
                            <Warehouse className="size-3.5" />
                          </IconBtn>
                          <IconBtn onClick={() => router.push(`/products/barcodes?product=${p.id}`)}>
                            <Barcode className="size-3.5" />
                          </IconBtn>
                          <IconBtn onClick={() => setDel(p)}>
                            <Trash2 className="size-3.5 text-destructive" />
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </Card>
      </div>
      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        title="Delete product?"
        description={`${del?.name} will be removed from the catalog.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (del) deleteProduct(del.id);
          toast.success("Product deleted");
        }}
      />
    </>
  );
}

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg p-1.5 hover:bg-muted">
      {children}
    </button>
  );
}
