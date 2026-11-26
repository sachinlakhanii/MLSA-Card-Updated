/* Input validation for the publish endpoint. Everything from the browser is untrusted. */

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Leave room below Vercel's 4.5 MB limit, including base64 and JSON overhead. */
export function checkPublishSize(body) {
  if (Buffer.byteLength(JSON.stringify(body), 'utf8') > 4_400_000) throw new HttpError(413, 'The upload is too large. Use a smaller photo.');
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED = new Set(['index', 'new', 'admin', 'api', 'assets', 'data', 'profile']);

export function cleanText(value, max) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

export function cleanSlug(value) {
  const slug = String(value || '');
  if (slug.length > 60 || !SLUG.test(slug) || RESERVED.has(slug)) throw new HttpError(400, 'Invalid profile link name.');
  return slug;
}

/** Only https LinkedIn URLs are kept; anything else is dropped. */
function cleanLinkedin(value) {
  try {
    const u = new URL(String(value || ''));
    const host = u.hostname.toLowerCase();
    if (u.protocol === 'https:' && (host === 'linkedin.com' || host.endsWith('.linkedin.com'))) return u.toString().slice(0, 200);
  } catch (e) { /* not a URL */ }
  return '';
}

/** External URLs are dropped; malformed GitHub usernames are rejected. */
export function cleanGithub(raw) {
  let value = String(raw || '').trim();
  if (!value || /^\[.*\]$/.test(value)) return '';
  if (/^[a-z][a-z\d+.-]*:/i.test(value) || value.includes('/')) {
    let url;
    try { url = new URL(value); } catch (e) { throw new HttpError(400, 'Invalid GitHub profile URL.'); }
    if (!['https:', 'http:'].includes(url.protocol) || url.hostname !== 'github.com' || url.username || url.password || url.port) return '';
    value = url.pathname.replace(/^\/|\/$/g, '');
  } else value = value.replace(/^@/, '');
  if (value.length > 39 || !/^[a-z\d]+(?:-[a-z\d]+)*$/i.test(value)) {
    throw new HttpError(400, 'GitHub usernames must be 1–39 letters or digits, with single hyphens only between them.');
  }
  return 'https://github.com/' + value;
}

export function cleanMember(input) {
  const m = input && typeof input === 'object' ? input : {};
  const name = cleanText(m.name, 60);
  const slug = cleanSlug(m.slug);
  if (!name) throw new HttpError(400, 'Member name is required.');
  return {
    name,
    slug,
    theme: m.theme === 'light' ? 'light' : 'dark',
    team: cleanText(m.team, 60),
    role: cleanText(m.role, 60),
    linkedin: cleanLinkedin(m.linkedin),
    github: cleanGithub(m.github),
    hasPhoto: Boolean(m.hasPhoto)
  };
}

const MAGIC = {
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/jpeg': [0xff, 0xd8, 0xff]
};

/** Decodes a base64 data URL, checking the declared type, the real file signature and the size. */
export function decodeImage(dataUrl, mime, maxBytes, label) {
  const prefix = `data:${mime};base64,`;
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith(prefix)) throw new HttpError(400, `Invalid ${label} image.`);
  const buf = Buffer.from(dataUrl.slice(prefix.length), 'base64');
  if (!buf.length || buf.length > maxBytes) throw new HttpError(413, `The ${label} image is too large.`);
  if (!MAGIC[mime].every((byte, i) => buf[i] === byte)) throw new HttpError(400, `Invalid ${label} image.`);
  return buf;
}
