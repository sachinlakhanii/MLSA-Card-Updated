/* Minimal GitHub client: reads a file and commits several files in ONE commit (Git Data API). */

const API = 'https://api.github.com';

async function gh(cfg, path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'User-Agent': 'msa-card-studio'
    }
  });
  if (!res.ok) {
    const err = new Error(`GitHub ${res.status} on ${path}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function readBinaryFile(cfg, path) {
  try { const file = await gh(cfg, `/repos/${cfg.repo}/contents/${path}?ref=${encodeURIComponent(cfg.branch)}`); return Buffer.from(file.content, 'base64'); }
  catch (e) { if (e.status === 404) return null; throw e; }
}
export async function listGitFiles(cfg, path) {
  const ref = await gh(cfg, `/repos/${cfg.repo}/git/ref/heads/${encodeURIComponent(cfg.branch)}`);
  const commit = await gh(cfg, `/repos/${cfg.repo}/git/commits/${ref.object.sha}`);
  const tree = await gh(cfg, `/repos/${cfg.repo}/git/trees/${commit.tree.sha}?recursive=1`);
  if (tree.truncated) throw new Error('GitHub tree is truncated.');
  return tree.tree.filter(f => f.type === 'blob' && f.path.startsWith(path + '/')).map(f => f.path);
}
/** Returns the file text, or null when the file does not exist yet. */
export async function readTextFile(cfg, path) {
  try {
    const file = await gh(cfg, `/repos/${cfg.repo}/contents/${path}?ref=${encodeURIComponent(cfg.branch)}`);
    return Buffer.from(file.content, 'base64').toString('utf8');
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

/** files: [{ path, content: Buffer | string }] */
export async function commitFiles(cfg, files, message) {
  const ref = await gh(cfg, `/repos/${cfg.repo}/git/ref/heads/${encodeURIComponent(cfg.branch)}`);
  const head = ref.object.sha;
  const headCommit = await gh(cfg, `/repos/${cfg.repo}/git/commits/${head}`);

  const tree = [];
  for (const f of files) {
    if (f.content === null) { tree.push({ path: f.path, mode: '100644', type: 'blob', sha: null }); continue; }
    const buf = Buffer.isBuffer(f.content) ? f.content : Buffer.from(f.content, 'utf8');
    const blob = await gh(cfg, `/repos/${cfg.repo}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({ content: buf.toString('base64'), encoding: 'base64' })
    });
    tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
  }

  const newTree = await gh(cfg, `/repos/${cfg.repo}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: headCommit.tree.sha, tree })
  });
  const commit = await gh(cfg, `/repos/${cfg.repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: newTree.sha, parents: [head] })
  });
  await gh(cfg, `/repos/${cfg.repo}/git/refs/heads/${encodeURIComponent(cfg.branch)}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha })
  });
  return commit.sha;
}
