export type ReceiptPayload = {
  storeName: string;
  invoiceNumber: string;
  lines: { name: string; quantity: string; total: string }[];
  total: string;
};

export interface PrinterService {
  printReceipt(receipt: ReceiptPayload): Promise<void>;
  openCashDrawer(): Promise<void>;
  testPrint(): Promise<void>;
}

/** Browser fallback. Hardware ESC/POS stays behind this interface. */
export class BrowserPrinter implements PrinterService {
  async printReceipt(): Promise<void> {
    if (typeof window !== "undefined") window.print();
  }

  async openCashDrawer(): Promise<void> {
    return;
  }

  async testPrint(): Promise<void> {
    if (typeof window !== "undefined") window.print();
  }
}
