export interface ConsoleIssue {
  type: 'error' | 'warning';
  text: string;
  location?: {
    url: string;
    lineNumber?: number;
    columnNumber?: number;
  };
  timestamp: string;
}

export interface PageException {
  message: string;
  stack?: string;
  timestamp: string;
}

export interface HttpError {
  url: string;
  method: string;
  status: number;
  statusText: string;
  resourceType: string;
  timestamp: string;
}

export interface LayoutOverflowElement {
  selector: string;
  tagName: string;
  id?: string;
  className?: string;
  scrollWidth: number;
  clientWidth: number;
  boundingRight: number;
  viewportWidth: number;
}

export interface LayoutIssue {
  hasHorizontalScroll: boolean;
  scrollWidth: number;
  viewportWidth: number;
  overflowAmount: number;
  culpritElements?: LayoutOverflowElement[];
}

export interface ViewportAudit {
  viewport: 'desktop' | 'mobile';
  deviceName?: string;
  viewportSize: {
    width: number;
    height: number;
  };
  screenshotFoldPath: string;
  screenshotFullPath: string;
  layout: LayoutIssue;
}

export interface TechnicalAuditResult {
  url: string;
  finalUrl: string;
  timestamp: string;
  durationMs: number;
  consoleErrors: ConsoleIssue[];
  pageExceptions: PageException[];
  httpErrors: HttpError[];
  viewports: {
    desktop: ViewportAudit;
    mobile: ViewportAudit;
  };
  outputDirectory: string;
}

export interface AuditOptions {
  timeoutMs?: number;
  outputDir?: string;
  verbose?: boolean;
}
