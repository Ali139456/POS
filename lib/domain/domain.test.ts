import assert from "node:assert/strict";
import test from "node:test";
import { addPaisa, paisaToRupees, rupeesToPaisa } from "./money.ts";
import { calculateInvoice, calculateLine } from "./tax.ts";
import { applyMovement, assertReturnQuantity, convertQuantity } from "./inventory.ts";
import { canSeeOrganization } from "./access.ts";

test("money converts rupees without floating point", () => {
  assert.equal(rupeesToPaisa("120.50"), 12050n);
  assert.equal(paisaToRupees(12050n), "120.50");
  assert.equal(addPaisa([rupeesToPaisa("0.10"), rupeesToPaisa("0.20")]), 30n);
});

test("exclusive tax is 18 percent of net", () => {
  const line = calculateLine(
    {
      quantityMilli: 1000n,
      unitPricePaisa: 10000n,
      discountPaisa: 0n,
      taxRateBps: 1800,
      exempt: false,
    },
    "exclusive",
  );
  assert.equal(line.netPaisa, 10000n);
  assert.equal(line.taxPaisa, 1800n);
  assert.equal(line.grossPaisa, 11800n);
});

test("inclusive tax splits a 118 rupee gross at 18 percent", () => {
  const line = calculateLine(
    {
      quantityMilli: 1000n,
      unitPricePaisa: 11800n,
      discountPaisa: 0n,
      taxRateBps: 1800,
      exempt: false,
    },
    "inclusive",
  );
  assert.equal(line.grossPaisa, 11800n);
  assert.equal(line.netPaisa, 10000n);
  assert.equal(line.taxPaisa, 1800n);
});

test("invoice discount cannot exceed the total", () => {
  assert.throws(() =>
    calculateInvoice({
      mode: "exclusive",
      invoiceDiscountPaisa: 5000n,
      lines: [
        {
          quantityMilli: 1000n,
          unitPricePaisa: 1000n,
          discountPaisa: 0n,
          taxRateBps: 0,
          exempt: true,
        },
      ],
    }),
  );
});

test("carton conversion uses an integer factor", () => {
  const pieces = convertQuantity(10_000n, "carton", "piece", [
    { fromCode: "carton", toCode: "piece", factorMilli: 24_000n },
  ]);
  assert.equal(pieces, 240_000n);
});

test("missing conversion is rejected", () => {
  assert.throws(() => convertQuantity(1000n, "kg", "piece", []));
});

test("sale cannot drive stock negative unless configured", () => {
  assert.throws(() => applyMovement(500n, "SALE", 1000n, false));
  const allowed = applyMovement(500n, "SALE", 1000n, true);
  assert.equal(allowed.quantityAfterMilli, -500n);
});

test("return cannot exceed sold quantity", () => {
  assert.throws(() => assertReturnQuantity(2000n, 1500n, 1000n));
  assertReturnQuantity(2000n, 1500n, 500n);
});

test("a child cannot see a sibling organization", () => {
  const childA = canSeeOrganization(new Set(["store-a"]), new Set(), "store-b");
  const parent = canSeeOrganization(new Set(["parent"]), new Set(["store-a", "store-b"]), "store-b");
  assert.equal(childA, false);
  assert.equal(parent, true);
});
