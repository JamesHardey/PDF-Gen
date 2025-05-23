declare module 'puppeteer-core' {
  export interface Browser {
    newPage(): Promise<Page>;
    close(): Promise<void>;
  }

  export interface Page {
    setContent(html: string, options?: { 
      waitUntil?: string | string[];
      timeout?: number;
    }): Promise<void>;
    pdf(options?: PDFOptions): Promise<Buffer>;
  }

  export interface PDFOptions {
    format?: string;
    printBackground?: boolean;
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
    timeout?: number;
  }

  export interface LaunchOptions {
    args?: string[];
    defaultViewport?: {
      width: number;
      height: number;
    };
    executablePath?: string;
    headless?: boolean | 'new' | 'shell';
    ignoreHTTPSErrors?: boolean;
  }

  export function launch(options?: LaunchOptions): Promise<Browser>;
} 