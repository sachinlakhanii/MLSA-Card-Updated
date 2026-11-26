/* Small shared helpers */
export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/** Lowercase, keep a-z 0-9 and hyphens only (no collapsing, so typing a hyphen works). */
export function cleanSlug(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-');
}

/** Final, tidy slug used when publishing. */
export function slugify(value) {
  return cleanSlug(value).replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

/** Returns '' when the field still holds its [placeholder] text. */
export function fieldValue(id) {
  const v = document.getElementById(id).value.trim();
  return /^\[.*\]$/.test(v) ? '' : v;
}

/** Accepts @handle, handle or a full URL. Returns a linkedin.com URL or ''. */
export function linkedinUrl(raw) {
  const v = (raw || '').trim().replace(/^\[|\]$/g, '');
  if (!v || /linkedin-handle/i.test(v)) return '';
  if (/^https?:\/\//i.test(v)) return v;
  return 'https://www.linkedin.com/in/' + v.replace(/^@/, '').replace(/^\/+|\/+$/g, '');
}

export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function say(el, text) {
  el.textContent = text || '';
}
