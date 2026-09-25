# Hardware

`lib/printing/printer.ts` defines `PrinterService` with `printReceipt`, `openCashDrawer`, and `testPrint`.

`BrowserPrinter` calls `window.print()`. USB and LAN ESC/POS printers need a local bridge that implements the same interface. The POS must not import a printer-brand SDK directly.

USB barcode scanners are keyboard devices. The POS scan loop, still to be added on the production checkout, keeps focus and treats Enter as the scanner suffix.
