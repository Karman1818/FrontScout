import path from 'node:path';
import { FinalAuditReport } from '../types/report.js';
import { saveJsonFile } from '../utils/fileSystem.js';

export async function generateJsonReport(
  report: FinalAuditReport,
  outputDir: string
): Promise<string> {
  const filePath = path.join(outputDir, 'report.json');
  await saveJsonFile(filePath, report);
  return filePath;
}
