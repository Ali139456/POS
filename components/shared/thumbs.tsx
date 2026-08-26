import { cn, initials } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { Milk, CupSoda, Cookie, ShoppingBasket, Sparkles, Snowflake, Croissant, Home, HeartPulse } from "lucide-react";

const icons: Record<string, typeof Milk> = {
  cat_dairy: Milk,
  cat_beverages: CupSoda,
  cat_snacks: Cookie,
  cat_grocery: ShoppingBasket,
  cat_personal: Sparkles,
  cat_frozen: Snowflake,
  cat_bakery: Croissant,
  cat_household: Home,
  cat_other: HeartPulse,
};

export function ProductThumb({ product, size = "md" }: { product: Pick<Product, "name" | "categoryId" | "imageHue">; size?: "sm" | "md" | "lg" }) {
  const Icon = icons[product.categoryId] ?? ShoppingBasket;
  const dim = size === "sm" ? "size-10" : size === "lg" ? "size-20" : "size-14";
  return (
    <div
      className={cn("flex aspect-square shrink-0 items-center justify-center rounded-xl text-white shadow-inner", dim)}
      style={{ background: `linear-gradient(145deg, hsl(${product.imageHue} 55% 42%), hsl(${product.imageHue} 50% 28%))` }}
    >
      <Icon className={size === "sm" ? "size-4" : "size-6"} />
    </div>
  );
}

export function AvatarHue({ name, hue, size = "md" }: { name: string; hue: number; size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? "size-8 text-xs" : size === "lg" ? "size-12 text-base" : "size-9 text-sm";
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full font-semibold text-white", dim)}
      style={{ background: `hsl(${hue} 45% 38%)` }}
    >
      {initials(name)}
    </div>
  );
}
