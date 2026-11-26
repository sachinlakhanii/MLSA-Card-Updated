/* Local development server (no Vercel account needed).
 * Serves the studio files and runs api/publish.js, reading settings from .env.local or .env.
 * Start with:  npm run dev   (then open http://localhost:3000) */

import http from 'node:http';
import { runLocalHandler } from './api-runner.js';
import { readFileSync, existsSync, statSync, createReadStream } from 'node:fs';
import { dirname, join, normalize, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

for (const name of ['.env', '.env.local']) {
  const file = join(root, name);
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !line.trim().startsWith('#')) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

if (process.env.LOCAL_SITE_DIR) process.env.LOCAL_SITE_DIR = resolve(root, process.env.LOCAL_SITE_DIR);
const REQUIRED = process.env.LOCAL_SITE_DIR ? ['ADMIN_KEY', 'SITE_URL'] : ['ADMIN_KEY', 'GITHUB_TOKEN', 'GITHUB_REPO', 'SITE_URL'];
const missing = REQUIRED.filter((k) => !process.env[k]);
const envFiles = ['.env', '.env.local'].filter((n) => existsSync(join(root, n)));
console.log(envFiles.length ? `Settings file found: ${envFiles.join(', ')}` : 'No .env.local or .env file found in ' + root);
if (missing.length) console.log('Missing settings (publishing will not work): ' + missing.join(', '));
else console.log(process.env.LOCAL_SITE_DIR ? 'LOCAL TEST MODE: members will be written to ' + process.env.LOCAL_SITE_DIR : 'All publishing settings are present (publishing to GitHub).');

const handlers = {};
for (const name of ['publish', 'members', 'member', 'delete', 'site']) handlers['/api/' + name] = name;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.webp': 'image/webp', '.woff2': 'font/woff2'
};
const PORT = Number(process.env.PORT) || 3000;
const MAX_BODY = 10 * 1024 * 1024;

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new Error('too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (handlers[url.pathname]) {
    req.query = Object.fromEntries(url.searchParams);
    // small shim so the Vercel-style handler works here
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (obj) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); };
    try {
      const raw = await readBody(req);
      try { req.body = raw ? JSON.parse(raw) : {}; } catch (e) { req.body = {}; }
    } catch (e) {
      return res.status(413).json({ error: 'The upload is too large.' });
    }
    res.setHeader('Cache-Control', 'no-store');
    try {
      const result = await runLocalHandler(handlers[url.pathname], { method: req.method, headers: req.headers, query: req.query, body: req.body });
      for (const [name, value] of Object.entries(result.headers)) res.setHeader(name, value);
      return res.status(result.status).json(result.body);
    } catch (error) {
      console.error('Local API request failed:', error.message);
      return res.status(500).json({ error: 'Local API failed. Check the server terminal.' });
    }
  }

  let filePath = normalize(join(root, decodeURIComponent(url.pathname)));
  if (!filePath.startsWith(root)) { res.statusCode = 403; return res.end('Forbidden'); }
  if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = join(filePath, 'index.html');
  if (!existsSync(filePath) || /[\\/]\.env/.test(filePath) || /[\\/](lib|scripts)[\\/]/.test(filePath)) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  res.setHeader('Content-Type', TYPES[extname(filePath)] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store');
  createReadStream(filePath).pipe(res);
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. If the studio is already running, open http://localhost:${PORT}.`);
    console.error('Otherwise, stop the existing server with Ctrl+C in its terminal, then run npm run dev again.');
  } else {
    console.error('Could not start the studio:', error.message);
  }
  process.exitCode = 1;
}).listen(PORT, () => console.log(`MLSA Card Studio running at http://localhost:${PORT}`));
