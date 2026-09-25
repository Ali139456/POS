/** Quantity in milli-units. 1 piece = 1000. 1.5 kg = 1500. */

export type Conversion = {
  fromCode: string;
  toCode: string;
  factorMilli: bigint;
};

export function convertQuantity(
  quantityMilli: bigint,
  fromCode: string,
  toCode: string,
  conversions: Conversion[],
): bigint {
  if (fromCode === toCode) return quantityMilli;
  const direct = conversions.find((item) => item.fromCode === fromCode && item.toCode === toCode);
  if (!direct) throw new Error(`No conversion from ${fromCode} to ${toCode}`);
  if (direct.factorMilli <= 0n) throw new Error("Invalid conversion factor");
  return (quantityMilli * direct.factorMilli) / 1000n;
}

export function assertReturnQuantity(soldMilli: bigint, alreadyReturnedMilli: bigint, requestedMilli: bigint): void {
  if (requestedMilli <= 0n) throw new Error("Return quantity must be positive");
  if (alreadyReturnedMilli + requestedMilli > soldMilli) {
    throw new Error("Return quantity exceeds quantity sold");
  }
}

export type Movement = "in" | "out";

const OUT_TYPES = new Set([
  "SALE",
  "PURCHASE_RETURN",
  "TRANSFER_OUT",
  "ADJUSTMENT_OUT",
  "DAMAGE",
  "EXPIRY",
]);

export function applyMovement(
  quantityBeforeMilli: bigint,
  movementType: string,
  quantityMilli: bigint,
  allowNegative: boolean,
): { quantityChangeMilli: bigint; quantityAfterMilli: bigint } {
  if (quantityMilli <= 0n) throw new Error("Movement quantity must be positive");
  const direction: Movement = OUT_TYPES.has(movementType) ? "out" : "in";
  const change = direction === "out" ? -quantityMilli : quantityMilli;
  const after = quantityBeforeMilli + change;
  if (after < 0n && !allowNegative) throw new Error("Negative stock is not allowed");
  return { quantityChangeMilli: change, quantityAfterMilli: after };
}
