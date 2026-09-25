/** Integer paisa. 1 PKR = 100 paisa. Never use binary floating point for money. */

export function rupeesToPaisa(rupees: string): bigint {
  const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(rupees.trim());
  if (!match) throw new Error("Invalid money amount");
  const sign = match[1] === "-" ? -1n : 1n;
  const whole = BigInt(match[2]);
  const frac = (match[3] ?? "").padEnd(2, "0");
  return sign * (whole * 100n + BigInt(frac));
}

export function paisaToRupees(paisa: bigint): string {
  const sign = paisa < 0n ? "-" : "";
  const abs = paisa < 0n ? -paisa : paisa;
  const whole = abs / 100n;
  const frac = (abs % 100n).toString().padStart(2, "0");
  return `${sign}${whole}.${frac}`;
}

export function addPaisa(values: bigint[]): bigint {
  return values.reduce((sum, value) => sum + value, 0n);
}
