import fsSync from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Normalizes a user input string into a valid web or file URL.
 * Automatically resolves existing local file paths to file:// URLs.
 */
export function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (fsSync.existsSync(trimmed)) {
    return pathToFileURL(path.resolve(trimmed)).href;
  }
  if (!/^https?:\/\//i.test(trimmed) && !/^file:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

