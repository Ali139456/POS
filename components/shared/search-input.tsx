"use client";

import { Children, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
  inputClassName,
  inputRef,
  onKeyDown,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}) {
  return (
    <div className={cn("relative min-w-0", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        className={cn("pl-9", inputClassName)}
      />
    </div>
  );
}

export function FilterBar({ children, className }: { children: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const items = Children.toArray(children);
  const search = items[0];
  const rest = items.slice(1);

  return (
    <>
      <div className={cn("flex w-full items-center gap-2 md:hidden", className)}>
        <div className="min-w-0 flex-1">{search}</div>
        {rest.length > 0 && (
          <Button variant="outline" className="h-11 shrink-0 px-3" onClick={() => setOpen(true)}>
            <SlidersHorizontal className="size-4" />
            <span className="hidden min-[380px]:inline">Filter</span>
          </Button>
        )}
      </div>
      <div className={cn("hidden w-full md:flex md:flex-wrap md:items-center md:gap-2", className)}>
        {children}
      </div>
      {rest.length > 0 && (
        <Dialog open={open} onClose={() => setOpen(false)} title="Filters">
          <div className="space-y-3 [&_select]:w-full">{rest}</div>
          <Button className="mt-4 w-full" onClick={() => setOpen(false)}>
            Apply filters
          </Button>
        </Dialog>
      )}
    </>
  );
}
