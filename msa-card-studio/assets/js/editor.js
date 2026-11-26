/* Photo editor: crop (drag + zoom) and simple filters */
import { $ } from './utils.js';
import { state } from './state.js';
import { showPhoto } from './card.js';
import { portraitGeometry } from './card-artwork.js';

const PRESETS = [
  // name, brightness, contrast, saturation, tint red, tint blue
  ['Original', 0, 0, 0, 0, 0],
  ['B&W', 0, 10, -100, 0, 0],
  ['Warm', 0, 0, 10, 12, -12],
  ['Cool', 0, 0, 0, -10, 12],
  ['Vivid', 0, 15, 40, 0, 0],
  ['Fade', 10, -15, -20, 0, 0]
];

const ed = { ar: 1, zoom: 1, ox: 0, oy: 0, b: 0, c: 0, s: 0, tr: 0, tb: 0, p: 0 };
let fresh = false; // true right after a new upload (Cancel then keeps the photo as is)

const modal = $('#edModal');
const cv = $('#edCv');
const cx = cv.getContext('2d', { willReadFrequently: true });
const inputs = { z: $('#edZoom'), b: $('#edB'), c: $('#edC'), s: $('#edS') };

function frameOf(W, H) {
  const img = state.srcImg;
  const sc = Math.max(W / img.naturalWidth, H / img.naturalHeight) * ed.zoom;
  const iw = img.naturalWidth * sc;
  const ih = img.naturalHeight * sc;
  const mx = Math.max(0, (iw - W) / 2 / W);
  const my = Math.max(0, (ih - H) / 2 / H);
  ed.ox = Math.max(-mx, Math.min(mx, ed.ox));
  ed.oy = Math.max(-my, Math.min(my, ed.oy));
  return { x: (W - iw) / 2 + ed.ox * W, y: (H - ih) / 2 + ed.oy * H, w: iw, h: ih };
}

function applyFilters(ctx, W, H) {
  if (!ed.b && !ed.c && !ed.s && !ed.tr && !ed.tb) return;
  const data = ctx.getImageData(0, 0, W, H);
  const a = data.data;
  const k = ed.c * 2.55;
  const f = (259 * (k + 255)) / (255 * (259 - k));
  const br = ed.b * 2.55;
  const sa = 1 + ed.s / 100;
  for (let i = 0; i < a.length; i += 4) {
    let r = a[i], g = a[i + 1], b = a[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = gray + (r - gray) * sa; g = gray + (g - gray) * sa; b = gray + (b - gray) * sa;
    r = f * (r - 128) + 128 + br + ed.tr;
    g = f * (g - 128) + 128 + br;
    b = f * (b - 128) + 128 + br + ed.tb;
    a[i] = r < 0 ? 0 : r > 255 ? 255 : r;
    a[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
    a[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
  }
  ctx.putImageData(data, 0, 0);
}

function paint(ctx, W, H) {
  ctx.clearRect(0, 0, W, H);
  const f = frameOf(W, H);
  ctx.drawImage(state.srcImg, f.x, f.y, f.w, f.h);
  applyFilters(ctx, W, H);
}

function preview() {
  const W = Math.min(360, window.innerWidth - 80);
  const H = Math.round(W / ed.ar);
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  paint(cx, W, H);
}

function syncControls() {
  inputs.z.value = Math.round(ed.zoom * 100);
  inputs.b.value = ed.b;
  inputs.c.value = ed.c;
  inputs.s.value = ed.s;
  document.querySelectorAll('#edChips .chip').forEach((chip, i) => chip.setAttribute('aria-pressed', String(i === ed.p)));
}

function open() {
  const portrait = portraitGeometry(document.getElementById('fTeam').value).photo;
  ed.ar = state.layout === 'wide' ? 372 / 390 : portrait[2] / portrait[3];
  modal.classList.add('is-open');
  syncControls();
  preview();
}

const close = () => modal.classList.remove('is-open');

function loadUpload(url) {
  const img = new Image();
  img.onload = () => {
    state.srcImg = img;
    Object.assign(ed, { zoom: 1, ox: 0, oy: 0, b: 0, c: 0, s: 0, tr: 0, tb: 0, p: 0 });
    $('#edBtn').disabled = false;
    fresh = true;
    open();
  };
  img.src = url;
}

export function resetEditor() {
  Object.assign(ed, { zoom: 1, ox: 0, oy: 0, b: 0, c: 0, s: 0, tr: 0, tb: 0, p: 0 });
  fresh = false;
}

export function initEditor() {
  PRESETS.forEach((p, i) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = p[0];
    chip.setAttribute('aria-pressed', String(i === 0));
    chip.addEventListener('click', () => {
      Object.assign(ed, { p: i, b: p[1], c: p[2], s: p[3], tr: p[4], tb: p[5] });
      syncControls();
      preview();
    });
    $('#edChips').appendChild(chip);
  });

  inputs.z.addEventListener('input', () => { ed.zoom = inputs.z.value / 100; preview(); });
  ['b', 'c', 's'].forEach((k) => inputs[k].addEventListener('input', () => { ed[k] = Number(inputs[k].value); preview(); }));

  let drag = null;
  cv.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; });
  cv.addEventListener('pointermove', (e) => {
    if (!drag) return;
    ed.ox += (e.clientX - drag.x) / cv.clientWidth;
    ed.oy += (e.clientY - drag.y) / cv.clientHeight;
    drag = { x: e.clientX, y: e.clientY };
    preview();
  });
  const endDrag = () => { drag = null; cv.style.cursor = 'grab'; };
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', endDrag);
  cv.addEventListener('wheel', (e) => {
    e.preventDefault();
    ed.zoom = Math.max(1, Math.min(4, ed.zoom - e.deltaY / 600));
    syncControls();
    preview();
  }, { passive: false });

  $('#edApply').addEventListener('click', () => {
    const W = 1000;
    const H = Math.round(1000 / ed.ar);
    const out = document.createElement('canvas');
    out.width = W; out.height = H;
    paint(out.getContext('2d', { willReadFrequently: true }), W, H);
    state.photo = out.toDataURL('image/jpeg', 0.93);
    fresh = false;
    showPhoto();
    close();
  });

  $('#edCancel').addEventListener('click', () => {
    if (fresh && state.srcImg) { state.photo = state.srcImg.src; showPhoto(); }
    close();
  });

  $('#edBtn').addEventListener('click', () => { if (state.srcImg) { fresh = false; open(); } });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) $('#edCancel').click();
  });

  const fileInput = $('#photoIn');
  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { loadUpload(reader.result); fileInput.value = ''; };
    reader.readAsDataURL(file);
  });
}
