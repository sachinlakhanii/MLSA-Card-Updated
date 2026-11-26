/* Card preview: text fields, theme, layout, scaling and photo display */
import { $, $$ } from './utils.js';
import { DIM, state } from './state.js';
import { initHandles, fitHandles } from './handles.js';
import { fitCardText } from './card-presentation.js';

export const c1 = $('#card');
export const c2 = $('#card2');
export const stage = $('#stage');
export const backPortrait = $('#cardBackPortrait');
export const currentCard = () => state.side === 'back' && state.layout === 'badge' ? backPortrait : (state.layout === 'wide' ? c1 : c2);
function showSide() {
  for (const card of [c1, c2, backPortrait]) card.style.display = card === currentCard() ? 'flex' : 'none';
}
export function setSide(side) {
  state.side = state.layout === 'badge' ? side : 'front';
  showSide(); pressed('sideFront', 'sideBack', state.side === 'front'); fit();
  document.dispatchEvent(new Event('card-side-change'));
}

function pressed(a, b, firstActive) {
  $('#' + a).setAttribute('aria-pressed', String(firstActive));
  $('#' + b).setAttribute('aria-pressed', String(!firstActive));
}

export function fitAll() {
  fitHandles(c1);
  fitCardText(c1);
  fitCardText(c2);
}

function bindField(inputId, className) {
  const input = document.getElementById(inputId);
  const update = () => {
    const value = input.value.trim() || '\u00A0';
    $$('.' + className).forEach((o) => { o.textContent = value; });
    fitAll();
  };
  input.addEventListener('input', update);
  update();
}

export function showPhoto() {
  const has = Boolean(state.photo);
  $$('.ph-img').forEach((img) => {
    if (has) { img.src = state.photo; img.style.display = 'block'; }
    else { img.removeAttribute('src'); img.style.display = 'none'; }
  });
  $$('.clr').forEach((b) => { b.style.display = has ? 'block' : 'none'; });
}

export function resetCardTheme() {
  state.light = false;
  for (const card of [c1,c2,backPortrait]) card.classList.remove('light');
  document.dispatchEvent(new Event('card-theme-change'));
}

export function fit() {
  const [w, h] = DIM[state.layout];
  const k = stage.clientWidth / w;
  currentCard().style.transform = `scale(${k})`;
  stage.style.height = h * k + 'px';
}

function setLayout(layout) {
  state.layout = layout;
  if (layout === 'wide') state.side = 'front';
  $('#cardSideControls').hidden = layout !== 'badge';
  pressed('sideFront', 'sideBack', state.side === 'front');
  showSide();
  stage.classList.toggle('is-portrait', layout === 'badge');
  pressed('lyWide', 'lyBadge', layout === 'wide');
  fit();
  fitAll();
  document.dispatchEvent(new Event('card-side-change'));
}

export function initCard() {
  bindField('fName', 'o-name');
  bindField('fTeam', 'o-team');
  bindField('fRole', 'o-role');
  initHandles(c1);

  document.addEventListener('new-member', () => setSide('front'));
  $('#sideFront').addEventListener('click', () => setSide('front'));
  $('#sideBack').addEventListener('click', () => setSide('back'));
  resetCardTheme();
  $('#lyWide').addEventListener('click', () => setLayout('wide'));
  $('#lyBadge').addEventListener('click', () => setLayout('badge'));

  $$('.clr').forEach((b) => b.addEventListener('click', () => {
    state.photo = null;
    state.srcImg = null;
    $('#edBtn').disabled = true;
    showPhoto();
  }));

  fit();
  window.addEventListener('resize', fit);
  if (window.ResizeObserver) new ResizeObserver(fit).observe(stage);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
}
