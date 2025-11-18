import crypto from 'node:crypto';
import { query } from './db';
import { getBaseUrl } from './config';

export const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export type LinkRecord = {
  code: string;
  url: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
};

type LinkRow = {
  code: string;
  url: string;
  clicks: number;
  last_clicked: string | null;
  created_at: string;
};

export class TinyLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TinyLinkError';
  }
}

export class ValidationError extends TinyLinkError {}
export class DuplicateCodeError extends TinyLinkError {}
export class DuplicateUrlError extends TinyLinkError {}

export function validateUrl(input: string) {
  try {
    // URL constructor validates protocol + structure.
    const parsed = new URL(input);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new ValidationError('Only HTTP/HTTPS URLs are supported.');
    }
    return parsed.toString();
  } catch {
    throw new ValidationError('Please provide a valid URL.');
  }
}

export function validateCode(input: string) {
  if (!CODE_REGEX.test(input)) {
    throw new ValidationError('Codes must be 6-8 alphanumeric characters.');
  }
  return input;
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateCodeCandidate() {
  const bytes = crypto.randomBytes(6);
  return Array.from(bytes)
    .map((byte) => characters[byte % characters.length])
    .join('')
    .slice(0, 6);
}

async function codeExists(code: string) {
  const result = await query<{ exists: boolean }>('SELECT EXISTS (SELECT 1 FROM links WHERE code = $1) as exists', [
    code
  ]);
  return result.rows[0]?.exists ?? false;
}

export async function generateUniqueCode(maxAttempts = 5): Promise<string> {
  for (let i = 0; i < maxAttempts; i += 1) {
    const candidate = generateCodeCandidate();
    const exists = await codeExists(candidate);
    if (!exists) {
      return candidate;
    }
  }
  throw new TinyLinkError('Unable to generate a unique code. Please try again.');
}

function mapRow(row: LinkRow | undefined): LinkRecord | null {
  if (!row) return null;
  return {
    code: row.code,
    url: row.url,
    clicks: Number(row.clicks),
    lastClicked: row.last_clicked,
    createdAt: row.created_at
  };
}

export async function getLinks(search?: string) {
  const params: unknown[] = [];
  let whereClause = '';
  if (search) {
    params.push(`%${search}%`);
    params.push(`%${search}%`);
    whereClause = 'WHERE code ILIKE $1 OR url ILIKE $2';
  }
  const sql = `SELECT code, url, clicks, last_clicked, created_at FROM links ${whereClause} ORDER BY created_at DESC`;
  const result = await query<LinkRow>(sql, params);
  return result.rows.map((row) => mapRow(row) as LinkRecord);
}

export async function getLink(code: string) {
  const result = await query<LinkRow>(
    'SELECT code, url, clicks, last_clicked, created_at FROM links WHERE code = $1 LIMIT 1',
    [code]
  );
  return mapRow(result.rows[0]);
}

export async function createLink(input: { url: string; code?: string }) {
  const normalizedUrl = validateUrl(input.url);

  const existing = await query<LinkRow>(
    'SELECT code, url, clicks, last_clicked, created_at FROM links WHERE url = $1 LIMIT 1',
    [normalizedUrl]
  );
  if (existing.rowCount && existing.rows[0]) {
    throw new DuplicateUrlError('A short link already exists for this target URL.');
  }

  const code = input.code ? validateCode(input.code) : await generateUniqueCode();
  try {
    const result = await query<LinkRow>(
      `INSERT INTO links (code, url) VALUES ($1, $2)
       RETURNING code, url, clicks, last_clicked, created_at`,
      [code, normalizedUrl]
    );
    return mapRow(result.rows[0]) as LinkRecord;
  } catch (error: any) {
    if (error?.code === '23505') {
      throw new DuplicateCodeError('This code is already taken. Please choose another.');
    }
    throw error;
  }
}

export async function deleteLink(code: string) {
  const result = await query('DELETE FROM links WHERE code = $1', [code]);
  return result.rowCount ?? 0;
}

export async function incrementClickAndGetUrl(code: string) {
  const result = await query<{ url: string }>(
    `UPDATE links
     SET clicks = clicks + 1, last_clicked = NOW()
     WHERE code = $1
     RETURNING url`,
    [code]
  );
  return result.rows[0]?.url ?? null;
}

export function serializeLink(link: LinkRecord) {
  const baseUrl = getBaseUrl();
  return {
    ...link,
    shortUrl: `${baseUrl}/${link.code}`
  };
}

