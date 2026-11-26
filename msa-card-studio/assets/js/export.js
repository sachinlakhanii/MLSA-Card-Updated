/* Renders the visible card to a PNG and handles the "Download PNG" button */
import { $, $$, saveBlob, slugify, say } from './utils.js';
import { DIM, state } from './state.js';
import { c1, c2, backPortrait } from './card.js';
import { fitHandles } from './handles.js';
import { prepareExportPhotos } from './export-photo.js';
import { ensureVerification } from './back.js';
import { cardBackSvg } from './verification.js';
import { applyCardArtwork, fitCardText } from './card-presentation.js';

/** Returns a PNG Blob of the current card. scale 3 = print quality, 1 = web size. */
export async function renderCard(scale, layout = state.layout, theme = state.light ? 'light' : 'dark', side = 'front') {
  theme = 'dark';
  if (side === 'back' && layout !== 'badge') throw new Error('The verification back is available for Portrait cards only.');
  if (side === 'back') await ensureVerification();
  const [w, h] = DIM[layout];
  const host = document.createElement('div');
  host.style.cssText = `position:absolute;left:-20000px;top:0;width:${w}px;height:${h}px;pointer-events:none`;
  const source = side === 'back' ? backPortrait : (layout === 'wide' ? c1 : c2);
  const clone = source.cloneNode(true);
  if (side === 'back') clone.querySelector('.back-image').src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(cardBackSvg({name:document.getElementById('fName').value.trim(),team:document.getElementById('fTeam').value,url:state.verificationUrl,layout,theme}));
  else applyCardArtwork(clone,layout,theme,document.getElementById('fTeam').value);
  clone.classList.toggle('light', theme === 'light');
  clone.style.transform = 'none';
  clone.style.display = 'flex';
  $$('.clr', clone).forEach((n) => n.remove());
  host.appendChild(clone);
  document.body.appendChild(host);

  // html2canvas ignores currentColor inside inline SVG, so resolve it first
  $$('svg', clone).forEach((svg) => {
    const color = getComputedStyle(svg).color;
    svg.innerHTML = svg.innerHTML.split('currentColor').join(color);
    if (svg.getAttribute('stroke') === 'currentColor') svg.setAttribute('stroke', color);
  });

  try {
    if (document.fonts) {
      await document.fonts.load('400 22px "Font Awesome 6 Brands"', '\uf08c\uf09b');
      await Promise.all([500,600,700].map(weight=>document.fonts.load(weight+' 40px Montserrat')));
      await document.fonts.ready;
    }
    if (side === 'back') await clone.querySelector('.back-image').decode();
    await Promise.all(Array.from(clone.querySelectorAll('img')).filter(img=>img.getAttribute('src')).map(img=>img.decode()));
    fitCardText(clone);
    await prepareExportPhotos(clone, scale);
    fitHandles(clone);
    const canvas = await window.html2canvas(clone, {
      scale, backgroundColor: null, useCORS: true, logging: false,
      width: w, height: h, windowWidth: w, windowHeight: h
    });
    return await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  } finally {
    host.remove();
  }
}

/** One print sheet: back on the left, front on the right, at identical scale. */
export async function renderPortraitPair(scale = 3, theme = state.light ? 'light' : 'dark') {
  theme = 'dark';
  await ensureVerification();
  const back = await renderCard(scale, 'badge', theme, 'back');
  const front = await renderCard(scale, 'badge', theme, 'front');
  if (!back || !front) return null;
  const images = [];
  let sheet;
  try {
    for (const blob of [back, front]) images.push(await createImageBitmap(blob));
    const [left, right] = images;
    if (left.width !== right.width || left.height !== right.height) throw new Error('Card dimensions do not match.');
    sheet = document.createElement('canvas');
    const gap = Math.round(64 * scale);
    sheet.width = left.width * 2 + gap; sheet.height = left.height;
    const ctx = sheet.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(left, 0, 0); ctx.drawImage(right, left.width + gap, 0);
    return await new Promise(resolve => sheet.toBlob(resolve, 'image/png'));
  } finally {
    images.forEach(image => image.close());
    if (sheet) { sheet.width = 1; sheet.height = 1; }
  }
}

export function initDownload() {
  const btn = $('#dl'), note = $('#dlNote');
  btn.addEventListener('click', async () => {
    if (typeof window.html2canvas !== 'function') return say(note, 'The image library did not load. Reload the page and try again.');
    const layout = state.layout, theme = state.light ? 'light' : 'dark';
    btn.disabled = true; btn.textContent = 'Preparing...'; say(note, '');
    try {
      if (layout === 'badge') await ensureVerification();
      let blob;
      for (const scale of [3, 2, 1.5]) {
        try { blob = layout === 'badge' ? await renderPortraitPair(scale, theme) : await renderCard(scale, 'wide', theme); }
        catch (error) { if (scale === 1.5) throw error; }
        if (blob) break;
      }
      if (!blob) throw new Error('Could not create the image. Please try again.');
      const slug = slugify(document.getElementById('fName').value) || 'member-card';
      const file = slug + '-' + (layout === 'badge' ? 'portrait' : 'wide') + '-' + theme + (layout === 'badge' ? '-front-and-back' : '') + '.png';
      saveBlob(blob, file); say(note, 'Saved ' + file);
    } catch (error) { say(note, error.message || 'Could not create the image. Please try again.'); }
    finally {
      btn.disabled = false;
      btn.textContent = state.layout === 'badge' ? 'Download front + back PNG' : 'Download PNG';
    }
  });
}
