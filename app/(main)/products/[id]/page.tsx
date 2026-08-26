"use client";

import { useParams } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";
import { ProductForm } from "@/components/products/product-form";
import { EmptyState } from "@/components/shared/page-header";
import { TopHeader } from "@/components/layout/top-header";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = useAppStore((s) => s.products.find((p) => p.id === id));
  if (!product) {
    return (
      <>
        <TopHeader title="Product" />
        <div className="p-6">
          <EmptyState title="Product not found" />
        </div>
      </>
    );
  }
  return <ProductForm existing={product} />;
}
