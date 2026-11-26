/* "Publish member": sends the profile and images to the private /api/publish endpoint */
import { $, cleanSlug, slugify, fieldValue, linkedinUrl, blobToDataUrl, loadImage, say } from './utils.js';
import { state } from './state.js';
import { renderCard } from './export.js';
import { renderSocial } from './social.js';
import { validateGithub } from './handles.js';
import { PUBLISH_VERSION } from './publish-protocol.js';

/** Photos are always sent as a JPEG of at most 1000px. */
async function photoAsJpeg(dataUrl) {
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, 1000 / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * scale);
  c.height = Math.round(img.naturalHeight * scale);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.9);
}

export function initPublish() {
  const nameInput = $('#fName');
  const slugInput = $('#slug');
  const keyInput = $('#adminKey');
  const button = $('#pubBtn');
  const note = $('#pubNote');
  let slugEdited = false;
  document.addEventListener('new-member', () => { slugEdited = false; });

  try { keyInput.value = sessionStorage.getItem('msaAdminKey') || ''; } catch (e) { /* ignore */ }

  slugInput.value = slugify(nameInput.value);
  nameInput.addEventListener('input', () => { if (!slugEdited && state.mode === 'create') slugInput.value = slugify(nameInput.value); });
  slugInput.addEventListener('input', () => { slugEdited = true; slugInput.value = cleanSlug(slugInput.value); });

  button.addEventListener('click', async () => {
    const name = fieldValue('fName');
    const slug = slugify(slugInput.value);
    const key = keyInput.value.trim();
    const github = validateGithub();
    if (github === null) { $('#fGh').focus(); return say(note, 'Correct the GitHub handle before publishing.'); }
    if (!name) return say(note, 'Enter the member name first.');
    if (!slug) return say(note, 'Enter a profile link name.');
    if (!key) return say(note, 'Enter the admin key.');
    if (typeof window.html2canvas !== 'function') return say(note, 'The image library did not load. Reload the page and try again.');

    button.disabled = true;
    button.textContent = 'Publishing…';
    say(note, '');
    try {
      try { sessionStorage.setItem('msaAdminKey', key); } catch (e) { /* ignore */ }

      const capabilities = await fetch('/api/members', { headers: { 'x-admin-key': key }, cache: 'no-store' });
      const server = await capabilities.json();
      if (!capabilities.ok) { say(note, server.error || 'Could not check publishing settings.'); return; }
      if (server.publishVersion !== PUBLISH_VERSION) {
        say(note, 'The studio server is out of date. Restart it and refresh this page before publishing.');
        return;
      }
      const member = {
        name, slug, theme: 'dark',
        team: fieldValue('fTeam'),
        role: fieldValue('fRole'),
        linkedin: linkedinUrl($('#fLi').value),
        github: github ? 'https://github.com/' + github : '',
        hasPhoto: Boolean(state.photo)
      };
      const photo = state.photo ? await photoAsJpeg(state.photo) : null;
      const socialBlob = await renderSocial(member, photo);
      if (!socialBlob) throw new Error('render');
      const social = await blobToDataUrl(socialBlob);
      let body = '';
      // Preserve existing website variant URLs, using the dark artwork in both site themes.
      for (const scale of [1.5, 1, .75]) {
        const cardBlob = await renderCard(scale, 'wide', member.theme);
        const alternateBlob = cardBlob;
        if (!cardBlob || !alternateBlob || cardBlob.size > 2_000_000 || alternateBlob.size > 2_000_000) continue;
        const candidate = JSON.stringify({ publishVersion: PUBLISH_VERSION, mode: state.mode, member, files: { photo, card: await blobToDataUrl(cardBlob), cardAlternate: await blobToDataUrl(alternateBlob), social } });
        if (new Blob([candidate]).size <= 4_400_000) { body = candidate; break; }
      }
      if (!body || socialBlob.size > 1_000_000 ||
          (photo && (photo.length - photo.indexOf(',') - 1) * 3 / 4 > 800_000)) {
        say(note, 'The upload is too large. Use a smaller photo.');
        return;
      }
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
        body
      });
      let data = {};
      try { data = await res.json(); } catch (e) { /* not JSON */ }

      if (res.ok) {
        say(note, `Published. Member ID ${data.id}. It goes live in about a minute at ${data.url}`);
        document.dispatchEvent(new Event('members-changed'));
      } else if (res.status === 401) {
        say(note, 'Wrong admin key.');
      } else if (res.status === 404) {
        say(note, 'Member not found. Reload the members list.');
      } else if (res.status === 409) {
        say(note, data.error || 'A member with this profile link already exists.');
      } else if (res.status === 413) {
        say(note, 'The upload is too large. Use a smaller photo.');
      } else if (res.status === 404 || res.status === 405) {
        say(note, 'Publishing is only available on the deployed studio, not when the file is opened locally.');
      } else {
        say(note, data.error || 'Publishing failed. Please try again.');
      }
    } catch (err) {
      say(note, 'Could not publish. Check your connection and try again.');
    } finally {
      button.disabled = false;
      button.textContent = state.mode === 'update' ? 'Update member' : 'Publish member';
    }
  });
}
