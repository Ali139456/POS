export type FbrStatus =
  | "FBR_PENDING"
  | "FBR_SUBMITTED"
  | "FBR_ACCEPTED"
  | "FBR_REJECTED"
  | "FBR_FAILED";

export type FbrInvoice = {
  saleId: string;
  organizationId: string;
  total: string;
};

export type FbrResult = {
  status: FbrStatus;
  referenceNumber?: string;
  response: Record<string, unknown>;
};

export interface TaxProvider {
  readonly name: string;
  submitInvoice(invoice: FbrInvoice): Promise<FbrResult>;
}

/** Development provider. It does not call FBR. */
export class DevTaxProvider implements TaxProvider {
  readonly name = "dev";

  async submitInvoice(invoice: FbrInvoice): Promise<FbrResult> {
    return {
      status: "FBR_ACCEPTED",
      referenceNumber: `DEV-${invoice.saleId}`,
      response: { mode: "development", accepted: true },
    };
  }
}
