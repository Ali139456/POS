"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadText, toCsv } from "@/lib/utils";

export function ExportMenu({
  filename,
  rows,
}: {
  filename: string;
  rows: Record<string, string | number>[];
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadText(`${filename}.csv`, toCsv(rows), "text/csv")}
    >
      <Download className="size-4" />
      Export CSV
    </Button>
  );
}
