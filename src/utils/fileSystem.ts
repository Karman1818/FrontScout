import fs from 'node:fs/promises';
import path from 'node:path';

export interface AuditPaths {
  rootDir: string;
  screenshotsDir: string;
  desktopFoldPng: string;
  desktopFullPng: string;
  mobileFoldPng: string;
  mobileFullPng: string;
  technicalAuditJson: string;
}

export function sanitizeHostname(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    if (url.protocol === 'file:') {
      const base = path.basename(url.pathname, path.extname(url.pathname));
      return base ? `local_${base}` : 'local_file';
    }
    const host = url.hostname.replace(/[^a-zA-Z0-9.-]/g, '_');
    return host || 'audit';
  } catch {
    return 'audit';
  }
}

export async function prepareAuditDirectory(urlStr: string, baseOutputDir: string = 'output'): Promise<AuditPaths> {
  const host = sanitizeHostname(urlStr);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sessionDirName = `${host}_${timestamp}`;
  const rootDir = path.resolve(process.cwd(), baseOutputDir, sessionDirName);
  const screenshotsDir = path.join(rootDir, 'screenshots');

  await fs.mkdir(screenshotsDir, { recursive: true });

  return {
    rootDir,
    screenshotsDir,
    desktopFoldPng: path.join(screenshotsDir, 'desktop-fold.png'),
    desktopFullPng: path.join(screenshotsDir, 'desktop-full.png'),
    mobileFoldPng: path.join(screenshotsDir, 'mobile-fold.png'),
    mobileFullPng: path.join(screenshotsDir, 'mobile-full.png'),
    technicalAuditJson: path.join(rootDir, 'technical-audit.json'),
  };
}

export async function saveJsonFile(filePath: string, data: unknown): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
