const FALLBACK_BASE_URL = 'https://tinylink-azhar.vercel.app';

export function getBaseUrl() {
  return process.env.BASE_URL?.replace(/\/$/, '') ?? FALLBACK_BASE_URL;
}

