import { timingSafeEqual } from 'node:crypto';
import { HttpError } from './validate.js';
import { storage } from './storage.js';
export function setup(req, res, method) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== method) { res.setHeader('Allow', method); throw new HttpError(405, 'Method not allowed.'); }
  const cfg = { token: process.env.GITHUB_TOKEN, repo: process.env.GITHUB_REPO, branch: process.env.GITHUB_BRANCH || 'main', site: (process.env.SITE_URL || '').replace(/\/+$/, ''), adminKey: process.env.ADMIN_KEY, localDir: process.env.LOCAL_SITE_DIR };
  if (!cfg.site || !cfg.adminKey || !(cfg.localDir || (cfg.token && cfg.repo))) throw new HttpError(500, 'The server is not configured yet.');
  const a = Buffer.from(String(req.headers['x-admin-key'] || '')), b = Buffer.from(cfg.adminKey);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new HttpError(401, 'Unauthorized.');
  return { cfg, store: storage(cfg) };
}
export async function members(store) {
  const raw = await store.readText('data/members.json');
  const data = raw ? JSON.parse(raw) : { members: [] };
  if (!Array.isArray(data.members)) throw new Error('Invalid members data.');
  return data;
}
export function fail(res, err) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  console.error('Member API failed:', err.message);
  return res.status(500).json({ error: 'Server error. Check the server settings and try again.' });
}
