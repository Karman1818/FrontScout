import { TechnicalAuditResult } from './audit.js';

export type IssueCategory =
  | 'layout'
  | 'cta'
  | 'typography'
  | 'contrast'
  | 'mobile-ux'
  | 'console'
  | 'network';

export type IssueSeverity = 'critical' | 'high' | 'medium';

export interface CodeFix {
  language: 'css' | 'javascript' | 'html';
  snippet: string;
  explanation: string;
}

export interface AuditIssue {
  id: string;
  title: string;
  category: IssueCategory;
  severity: IssueSeverity;
  impact: string;
  technicalProof: string;
  codeFix: CodeFix;
}

export interface OutreachEmail {
  subject: string;
  bodySnippet: string;
}

export interface FinalAuditReport {
  url: string;
  auditTimestamp: string;
  modelUsed: string;
  summary: string;
  topIssues: AuditIssue[];
  outreachEmail: OutreachEmail;
  technicalData: TechnicalAuditResult;
}
