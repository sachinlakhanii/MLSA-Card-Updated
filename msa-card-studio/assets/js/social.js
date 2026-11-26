/* Builds the 1200x630 social preview image for a member */

function node(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

function initials(name) {
  return name.split(/\s+/).map((w) => w.charAt(0)).join('').slice(0, 2).toUpperCase();
}

export async function renderSocial(member, photoUrl) {
  const root = node('div', 'sc');

  const main = node('div', 'sc-main');
  const head = node('div', 'sc-head');
  const logo = node('div', 'sc-logo brand-lockup');
  const logoImg = new Image();
  logoImg.src = new URL('../img/microsoft_learn_student_ambassador_4k_transparent.png', import.meta.url).href;
  logoImg.alt = '';
  logo.appendChild(logoImg);
  const titles = node('div');
  titles.append(node('div', 'sc-top', 'MICROSOFT LEARN'), node('div', 'sc-title', 'Student Ambassador'));
  head.append(logo, titles);

  const identity = node('div');
  const name = node('div', 'sc-name', member.name);
  name.style.fontSize = (member.name.length > 22 ? 54 : member.name.length > 16 ? 64 : 76) + 'px';
  identity.append(node('div', 'sc-eyebrow', 'CORE TEAM'), name);
  if (member.team) identity.appendChild(node('div', 'sc-team', member.team));
  if (member.role) identity.appendChild(node('div', 'sc-role', member.role));

  main.append(head, identity, node('div', 'sc-verified', 'Verified member \u00B7 MLSA SZABIST Islamabad'));

  const wrap = node('div', 'sc-photo-wrap');
  const photo = node('div', 'sc-photo');
  if (photoUrl) {
    const img = new Image();
    img.src = photoUrl;
    img.alt = '';
    photo.appendChild(img);
  } else {
    photo.textContent = initials(member.name);
  }
  wrap.appendChild(photo);

  const strip = node('div', 'strip');
  for (let i = 0; i < 4; i++) strip.appendChild(document.createElement('i'));

  root.append(main, wrap, strip);

  const host = node('div');
  host.style.cssText = 'position:absolute;left:-20000px;top:0;width:1200px;height:630px';
  host.appendChild(root);
  document.body.appendChild(host);

  try {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await Promise.all(Array.from(root.querySelectorAll('img')).map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
    const canvas = await window.html2canvas(root, {
      scale: 1, backgroundColor: '#0A0E17', useCORS: true, logging: false,
      width: 1200, height: 630, windowWidth: 1200, windowHeight: 630
    });
    return await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  } finally {
    host.remove();
  }
}
