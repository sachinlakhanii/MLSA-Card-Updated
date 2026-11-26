/* Social handle parsing and the wide card's single-line footer. */
import { $, fieldValue } from './utils.js';

export function githubHandle(raw) {
  let value = String(raw || '').trim();
  if (!value || /^\[.*\]$/.test(value)) return '';
  if (/^[a-z][a-z\d+.-]*:/i.test(value) || value.includes('/')) {
    let url;
    try { url = new URL(value); } catch (e) { throw new Error('Use a GitHub username or a full https://github.com/username URL.'); }
    if (!['https:', 'http:'].includes(url.protocol) || url.hostname !== 'github.com' || url.username || url.password || url.port) {
      throw new Error('Use a github.com profile URL. Other websites are not accepted.');
    }
    value = url.pathname.replace(/^\/|\/$/g, '');
  } else value = value.replace(/^@/, '');
  if (value.length > 39 || !/^[a-z\d]+(?:-[a-z\d]+)*$/i.test(value)) {
    throw new Error('GitHub usernames must be 1–39 letters or digits, with single hyphens only between them.');
  }
  return value;
}

function linkedinHandle(value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (url.hostname !== 'linkedin.com' && !url.hostname.endsWith('.linkedin.com')) return '';
      return decodeURIComponent(url.pathname.replace(/^\/in\//, '').replace(/^\/|\/$/g, '')).replace(/^@/, '');
    } catch (e) { return ''; }
  }
  return value.replace(/^@/, '');
}

export function validateGithub() {
  const input = $('#fGh');
  try {
    const username = githubHandle(input.value);
    input.setCustomValidity(''); input.setAttribute('aria-invalid', 'false');
    $('#githubNote').textContent = '';
    return username;
  } catch (err) {
    input.setCustomValidity(err.message); input.setAttribute('aria-invalid', 'true');
    $('#githubNote').textContent = err.message;
    return null;
  }
}

export function fitHandles(card) {
  const row = $('.social-handles', card);
  if (!row || row.hidden || !row.clientWidth) return;
  const texts = Array.from(row.querySelectorAll('.social-username')).filter(n => !n.parentElement.hidden);
  let size = 20;
  row.style.setProperty('--handle-size', size + 'px');
  while (size > 14 && texts.some(n => n.scrollWidth > n.clientWidth)) {
    size--; row.style.setProperty('--handle-size', size + 'px');
  }
}

export function initHandles(card) {
  const row = $('.social-handles', card);
  function update() {
    const github = validateGithub() || '';
    const linkedin = linkedinHandle(fieldValue('fLi'));
    const li = $('.social-linkedin', row), gh = $('.social-github', row);
    li.hidden = !linkedin; gh.hidden = !github;
    $('.social-username', li).textContent = linkedin;
    $('.social-username', gh).textContent = github;
    $('.social-divider', row).hidden = !(linkedin && github);
    row.hidden = !(linkedin || github);
    fitHandles(card);
  }
  $('#fLi').addEventListener('input', update);
  $('#fGh').addEventListener('input', update);
  $('#fGh').addEventListener('blur', () => {
    const username = validateGithub();
    if (username !== null && $('#fGh').value !== '[@github-handle]') $('#fGh').value = username;
  });
  update();
}
