/* Local test mode: read/write the website folder on disk instead of GitHub.
 * Only used when LOCAL_SITE_DIR is set (development on your own computer). */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';

function safePath(dir, relativePath) {
  const base = resolve(dir);
  const full = resolve(base, relativePath);
  if (full !== base && !full.startsWith(base + sep)) throw new Error('Path outside the website folder.');
  return full;
}

export async function readLocalFile(dir, path) {
  try {
    return await readFile(safePath(dir, path), 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
}

export async function writeLocalFiles(dir, files) {
  for (const f of files) {
    const full = safePath(dir, f.path);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, f.content);
  }
}
