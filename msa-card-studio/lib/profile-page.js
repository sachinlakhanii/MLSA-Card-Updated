/* Generates the public, static member profile and its social metadata. */
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const paths = {
  back: '<path d="m12 19-7-7 7-7M5 12h14"/>',
  check: '<path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  link: '<path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M16 8l1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(0 0) scale(.95)"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  external: '<path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>'
};
const icon = (name) => `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Karachi' });
}

export function profileHtml(m, siteUrl) {
  const url = `${siteUrl}/profile/${m.slug}`;
  const asset = `/assets/members/${m.slug}`;
  const revision = m.assetVersion ? '?v=' + encodeURIComponent(m.assetVersion) : '';
  const themedCard = `data-theme-dark="${esc(asset + (m.cardThemes ? '/card-dark.png' : '/card.png') + revision)}" data-theme-light="${esc(asset + (m.cardThemes ? '/card-light.png' : '/card.png') + revision)}" data-theme-fallback="${esc(asset)}/card.png${esc(revision)}"`;
  const title = `${m.name} | MLSA SZABIST Islamabad`;
  const ogTitle = `${m.name} | Verified MLSA SZABIST Member`;
  const desc = `${m.name} is a verified member${m.role ? ` (${m.role})` : ''}${m.team ? ` of the ${m.team} team` : ''} at MLSA SZABIST Islamabad.`;
  const initials = String(m.name || '').trim().split(/\s+/).map(word => Array.from(word)[0] || '').slice(0, 2).join('').toUpperCase();
  const rows = [
    ['Organization', 'MLSA SZABIST Islamabad', 'detail-wide'],
    m.team && ['Team', m.team],
    m.role && ['Role', m.role],
    ['Member since', formatDate(m.issued), 'detail-wide']
  ].filter(Boolean).map(([label, value, cls]) => `<div${cls ? ` class="${cls}"` : ''}><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('\n          ');

  return `<!DOCTYPE html>
<html lang="en" class="profile-root">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${esc(url)}">
  <link rel="icon" href="/assets/img/microsoft_learn_student_ambassador_4k_transparent.png" type="image/png">
  <script src="/assets/js/theme.js"></script>
  <meta property="og:type" content="profile">
  <meta property="og:site_name" content="MLSA SZABIST Islamabad">
  <meta property="og:title" content="${esc(ogTitle)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:image" content="${esc(siteUrl + asset)}/social.png${esc(revision)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(ogTitle)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${esc(siteUrl + asset)}/social.png${esc(revision)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/profile.css">
  <link rel="stylesheet" href="/assets/css/brand.css">
  <link rel="stylesheet" href="/assets/vendor/fontawesome/css/fontawesome.min.css">
  <link rel="stylesheet" href="/assets/vendor/fontawesome/css/brands.min.css">
</head>
<body class="profile-page">
  <header class="site-header profile-header">
    <a class="profile-brand" href="/" aria-label="MLSA SZABIST Islamabad home"><span class="brand-lockup profile-wordmark"><img src="/assets/img/microsoft_learn_student_ambassador_4k_transparent.png" alt="Microsoft Learn Student Ambassador logo"></span><span>MLSA <small>SZABIST Islamabad</small></span></a>
    <div class="header-actions"><a class="back-link" href="/" aria-label="All members">${icon('back')}<span>All members</span></a><button type="button" class="theme-toggle" data-theme-toggle hidden><span data-theme-icon aria-hidden="true"></span><span data-theme-label>Theme</span></button></div>
  </header>
  <main class="profile-main">
    <div class="profile-intro profile-reveal"><span class="eyebrow">THE MEMBER DIRECTORY</span><span class="intro-line" aria-hidden="true"></span><span>Public membership record</span></div>
    <div class="profile-layout">
      <section class="hero-card profile-reveal" aria-labelledby="memberName">
        <div class="overview-topline"><span class="eyebrow">MEMBER PROFILE</span><span class="badge">${icon('check')}Verified member</span></div>
        <div class="identity-block">
          <div class="avatar-shell"><span class="avatar-initials" aria-hidden="true">${esc(initials)}</span>${m.photo ? `<img class="photo" src="${esc(asset)}/photo.jpg${esc(revision)}" alt="${esc(m.name)}" width="112" height="112">` : ''}<span class="avatar-check" aria-hidden="true">${icon('check')}</span></div>
          <div class="identity-text"><h1 id="memberName">${esc(m.name)}</h1>${m.role ? `<p class="role">${esc(m.role)}</p>` : ''}${m.team ? `<p class="team">${esc(m.team)}</p>` : ''}</div>
        </div>
        ${m.linkedin || m.github ? `<div class="profile-socials">
          ${m.linkedin ? `<a class="social-button" href="${esc(m.linkedin)}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-linkedin" aria-hidden="true"></i><span>View LinkedIn</span>${icon('external')}</a>` : ''}
          ${m.github ? `<a class="social-button" href="${esc(m.github)}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github" aria-hidden="true"></i><span>View GitHub</span>${icon('external')}</a>` : ''}
        </div>` : ''}
      </section>
      <section class="card-showcase profile-reveal" aria-labelledby="cardHeading">
        <div class="showcase-heading"><div><span class="eyebrow">DIGITAL IDENTITY</span><h2 id="cardHeading">Member card</h2></div><span class="card-corner-mark" aria-hidden="true">${icon('check')}</span></div>
        <a class="card-preview" href="${esc(asset)}/card.png${esc(revision)}" ${themedCard} data-open-card aria-label="Enlarge member card for ${esc(m.name)}"><img class="member-card" src="${esc(asset)}/card.png${esc(revision)}" ${themedCard} alt="Member card of ${esc(m.name)}" width="1080" height="1012" decoding="async"></a>
        <div class="card-toolbar"><a class="text-action" href="${esc(asset)}/card.png${esc(revision)}" ${themedCard} data-open-card>${icon('expand')}<span>Full size</span></a><a class="text-action" href="${esc(asset)}/card.png${esc(revision)}" ${themedCard} download="${esc(m.slug)}-card.png">${icon('download')}<span>Download</span></a></div>
      </section>
      <section class="credentials profile-reveal" aria-labelledby="detailsHeading">
        <div class="section-heading"><h2 id="detailsHeading">Membership details</h2><span class="section-index" aria-hidden="true">DIRECTORY RECORD</span></div>
        <dl class="details">
          ${rows}
        </dl>
        <button type="button" class="share-button copy-action" data-copy-link>${icon('link')}Copy profile link</button>
      </section>
      <aside class="record-note profile-reveal">${icon('check')}<p>This page confirms ${esc(m.name)}'s membership with MLSA SZABIST Islamabad. Use the details on this page when verifying a member card.</p></aside>
    </div>
  </main>
  <footer class="site-footer profile-footer"><span>&copy; MLSA SZABIST Islamabad</span><span class="footer-label">Microsoft Learn Student Ambassadors</span></footer>
  <dialog class="card-dialog" id="cardDialog" aria-labelledby="dialogHeading">
    <div class="dialog-heading"><h2 id="dialogHeading">Member card</h2><button type="button" class="icon-button" data-close-card aria-label="Close member card" autofocus>${icon('close')}</button></div>
    <div class="dialog-image"><img src="${esc(asset)}/card.png${esc(revision)}" ${themedCard} alt="Member card of ${esc(m.name)}" width="1080" height="1012" loading="lazy"></div>
  </dialog>
  <p class="profile-toast" id="profileStatus" role="status" aria-live="polite" aria-atomic="true"></p>
  <script src="/assets/js/profile.js" defer></script>
</body>
</html>
`;
}
