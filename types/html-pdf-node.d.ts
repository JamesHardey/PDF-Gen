declare module 'html-pdf-node' {
  interface PDFOptions {
    format?: string;
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
    printBackground?: boolean;
    preferCSSPageSize?: boolean;
    [key: string]: any;
  }

  interface PDFContent {
    content: string;
    [key: string]: any;
  }

  interface HTMLPDFNode {
    generatePdf(content: PDFContent, options?: PDFOptions): Promise<Buffer>;
  }

  const htmlPdf: HTMLPDFNode;
  export default htmlPdf;
} 