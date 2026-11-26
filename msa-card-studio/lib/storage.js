import { readFile, readdir, mkdir, writeFile, unlink } from 'node:fs/promises';
import { resolve, sep, dirname } from 'node:path';
import { readBinaryFile, listGitFiles, commitFiles } from './github.js';

function safePath(dir, path) {
  const base = resolve(dir), full = resolve(base, path);
  if (full !== base && !full.startsWith(base + sep)) throw new Error('Path outside the website folder.');
  return full;
}
export function storage(cfg) {
  async function readBinary(path) {
    if (!cfg.localDir) return readBinaryFile(cfg, path);
    try { return await readFile(safePath(cfg.localDir, path)); } catch (e) { if (e.code === 'ENOENT') return null; throw e; }
  }
  async function list(path) {
    if (!cfg.localDir) return listGitFiles(cfg, path);
    async function walk(relative) {
      let entries;
      try { entries = await readdir(safePath(cfg.localDir, relative), { withFileTypes: true }); }
      catch (e) { if (e.code === 'ENOENT') return []; throw e; }
      const found = [];
      for (const entry of entries) {
        const child = relative + '/' + entry.name;
        if (entry.isDirectory()) found.push(...await walk(child));
        else if (entry.isFile()) found.push(child);
      }
      return found;
    }
    return walk(path);
  }
  return {
    readBinary,
    async readText(path) { const b = await readBinary(path); return b === null ? null : b.toString('utf8'); },
    list,
    async commit(files, message) {
      if (!cfg.localDir) return commitFiles(cfg, files, message);
      // Preserve old contents so a failed local write can be rolled back.
      const old = await Promise.all(files.map(async f => ({ path: f.path, content: await readBinary(f.path) })));
      async function apply(f) {
        const full = safePath(cfg.localDir, f.path);
        if (f.content === null) { try { await unlink(full); } catch (e) { if (e.code !== 'ENOENT') throw e; } }
        else { await mkdir(dirname(full), { recursive: true }); await writeFile(full, f.content); }
      }
      try { for (const f of files) await apply(f); }
      catch (e) { for (const f of old) await apply(f); throw e; }
    }
  };
}
