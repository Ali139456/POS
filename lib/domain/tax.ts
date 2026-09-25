import { addPaisa } from "./money.ts";

export type TaxMode = "inclusive" | "exclusive";

export type LineInput = {
  quantityMilli: bigint;
  unitPricePaisa: bigint;
  discountPaisa: bigint;
  taxRateBps: number;
  exempt: boolean;
};

export type LineResult = {
  netPaisa: bigint;
  taxPaisa: bigint;
  grossPaisa: bigint;
};

export type InvoiceInput = {
  lines: LineInput[];
  invoiceDiscountPaisa: bigint;
  mode: TaxMode;
};

export type InvoiceResult = {
  lines: LineResult[];
  subtotalPaisa: bigint;
  discountPaisa: bigint;
  taxPaisa: bigint;
  totalPaisa: bigint;
};

function taxOnExclusive(net: bigint, rateBps: number): bigint {
  return (net * BigInt(rateBps) + 5000n) / 10000n;
}

function splitInclusive(gross: bigint, rateBps: number): { net: bigint; tax: bigint } {
  const net = (gross * 10000n) / (10000n + BigInt(rateBps));
  return { net, tax: gross - net };
}

export function calculateLine(line: LineInput, mode: TaxMode): LineResult {
  if (line.quantityMilli <= 0n) throw new Error("Quantity must be positive");
  if (line.discountPaisa < 0n) throw new Error("Discount cannot be negative");
  const extended = (line.unitPricePaisa * line.quantityMilli) / 1000n;
  if (line.discountPaisa > extended) throw new Error("Discount exceeds line amount");
  const afterDiscount = extended - line.discountPaisa;
  if (line.exempt || line.taxRateBps === 0) {
    return { netPaisa: afterDiscount, taxPaisa: 0n, grossPaisa: afterDiscount };
  }
  if (mode === "exclusive") {
    const tax = taxOnExclusive(afterDiscount, line.taxRateBps);
    return { netPaisa: afterDiscount, taxPaisa: tax, grossPaisa: afterDiscount + tax };
  }
  const split = splitInclusive(afterDiscount, line.taxRateBps);
  return { netPaisa: split.net, taxPaisa: split.tax, grossPaisa: afterDiscount };
}

export function calculateInvoice(input: InvoiceInput): InvoiceResult {
  if (input.invoiceDiscountPaisa < 0n) throw new Error("Discount cannot be negative");
  const lines = input.lines.map((line) => calculateLine(line, input.mode));
  const grossBeforeInvoiceDiscount = addPaisa(lines.map((line) => line.grossPaisa));
  if (input.invoiceDiscountPaisa > grossBeforeInvoiceDiscount) {
    throw new Error("Invoice discount exceeds total");
  }
  const discountRatio =
    grossBeforeInvoiceDiscount === 0n
      ? 0n
      : input.invoiceDiscountPaisa;
  const adjusted = lines.map((line) => {
    if (discountRatio === 0n || grossBeforeInvoiceDiscount === 0n) return line;
    const share = (line.grossPaisa * input.invoiceDiscountPaisa) / grossBeforeInvoiceDiscount;
    const gross = line.grossPaisa - share;
    if (line.taxPaisa === 0n) return { netPaisa: gross, taxPaisa: 0n, grossPaisa: gross };
    const tax = (line.taxPaisa * gross) / line.grossPaisa;
    return { netPaisa: gross - tax, taxPaisa: tax, grossPaisa: gross };
  });
  const subtotalPaisa = addPaisa(adjusted.map((line) => line.netPaisa));
  const taxPaisa = addPaisa(adjusted.map((line) => line.taxPaisa));
  const totalPaisa = addPaisa(adjusted.map((line) => line.grossPaisa));
  return {
    lines: adjusted,
    subtotalPaisa,
    discountPaisa: input.invoiceDiscountPaisa,
    taxPaisa,
    totalPaisa,
  };
}
