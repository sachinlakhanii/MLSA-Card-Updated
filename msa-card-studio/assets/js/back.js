/* QR codes use the configured public website, never the private editor address. */
import { state } from './state.js';
import { profileUrl, cardBackSvg } from './verification.js';
let siteUrl = '', ready;
function update() {
  const note = document.getElementById('qrNote');
  note.hidden = state.side !== 'back';
  let url, message;
  try { url = profileUrl(siteUrl, document.getElementById('slug').value.trim()); }
  catch { message = siteUrl ? 'Enter a valid profile username to generate the QR code.' : 'Verification is unavailable. Check SITE_URL and refresh the studio.'; }
  state.verificationUrl = url || null;
  for (const [id, layout] of [['cardBackPortrait','badge']]) {
    const card = document.getElementById(id), img = card.querySelector('img'), error = card.querySelector('.back-message');
    img.hidden = !url; error.hidden = Boolean(url);
    if (!url) { error.textContent = message; img.removeAttribute('src'); continue; }
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(cardBackSvg({name:document.getElementById('fName').value.trim(),team:document.getElementById('fTeam').value,url,layout,theme:state.light?'light':'dark'}));
  }
  note.textContent = message || 'QR links to ' + url + '. Publish this member before sharing the card.';
  if (url && ['localhost','127.0.0.1','[::1]'].includes(new URL(url).hostname)) note.textContent += ' This is a local test URL; set SITE_URL to your public website before printing.';
}
export async function ensureVerification() {
  await ready; update();
  if (!state.verificationUrl) throw new Error('Enter a valid profile username and configure SITE_URL before downloading the back.');
  return state.verificationUrl;
}
export function initBack() {
  ready = fetch('/api/site', {cache:'no-store'}).then(async response => {
    if (!response.ok) throw new Error('Website settings unavailable');
    const data = await response.json(); profileUrl(data.siteUrl, 'check'); siteUrl = data.siteUrl;
  }).catch(() => { siteUrl = ''; }).finally(update);
  for (const id of ['slug','fName','fTeam']) document.getElementById(id).addEventListener('input', update);
  for (const name of ['card-theme-change','card-side-change','new-member']) document.addEventListener(name, update);
  new MutationObserver(update).observe(document.getElementById('editingNote'), {childList:true});
}
