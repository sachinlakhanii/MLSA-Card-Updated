/* Help visitors recover from a missing URL, while preserving the real HTTP 404 response. */
(function () {
  'use strict';
  var path;
  try { path = decodeURIComponent(window.location.pathname); } catch (error) { path = window.location.pathname; }
  if (/^\/profile(?:\/|$)/.test(path)) {
    document.getElementById('errorKind').textContent = 'PROFILE NOT FOUND';
    document.getElementById('errorHeading').textContent = "This profile isn't here.";
    document.title = '404 - Profile not found | MLSA SZABIST Islamabad';
  }
  var back = document.getElementById('goBack');
  try {
    if (document.referrer && new URL(document.referrer).origin === window.location.origin && history.length > 1) {
      back.hidden = false; back.addEventListener('click', function () { history.back(); });
    }
  } catch (error) { /* The directory link remains available. */ }
  var input = document.getElementById('memberQuery'), list = document.getElementById('memberResults');
  var feedback = document.getElementById('searchFeedback'), timer, memberPromise;
  document.getElementById('recoverySearch').hidden = false;
  function members() {
    if (!memberPromise) memberPromise = fetch('/data/members.json', { cache: 'no-store' })
      .then(function (response) { if (!response.ok) throw new Error('Directory unavailable'); return response.json(); })
      .then(function (data) {
        if (!Array.isArray(data.members)) throw new Error('Invalid directory');
        return data.members.filter(function (m) { return m && typeof m.name === 'string' && typeof m.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(m.slug) && m.slug.length <= 60; });
      }).catch(function (error) { memberPromise = null; throw error; });
    return memberPromise;
  }
  async function search() {
    var query = input.value.trim().toLowerCase();
    list.textContent = '';
    if (!query) { feedback.textContent = 'Search the member directory to find the correct profile.'; return; }
    feedback.textContent = 'Searching members...';
    try {
      var data = await members();
      if (input.value.trim().toLowerCase() !== query) return;
      var found = data.filter(function (m) { return [m.name, m.slug, m.team || ''].join(' ').toLowerCase().includes(query); });
      feedback.textContent = found.length ? found.length + ' matching member' + (found.length === 1 ? '' : 's') + (found.length > 5 ? '. Showing the first 5.' : '.') : data.length ? 'No matches. Try another name, username or team.' : 'No profiles are listed yet. Check the directory again soon.';
      found.slice(0, 5).forEach(function (member) {
        var item = document.createElement('li'), link = document.createElement('a'), text = document.createElement('span');
        var name = document.createElement('strong'), detail = document.createElement('small'), arrow = document.createElement('span');
        link.className = 'recovery-member'; link.href = '/profile/' + encodeURIComponent(member.slug);
        name.textContent = member.name; detail.textContent = [member.role, member.team].filter(Boolean).join(' / ');
        text.appendChild(name); if (detail.textContent) text.appendChild(detail);
        arrow.className = 'result-arrow'; arrow.textContent = '\u2192'; arrow.setAttribute('aria-hidden', 'true');
        link.appendChild(text); link.appendChild(arrow); item.appendChild(link); list.appendChild(item);
      });
    } catch (error) {
      if (input.value.trim().toLowerCase() === query) feedback.textContent = 'Search is unavailable right now. You can still use Browse members.';
    }
  }
  input.addEventListener('input', function () { window.clearTimeout(timer); timer = window.setTimeout(search, 150); });
  document.getElementById('memberSearch').addEventListener('submit', function (event) { event.preventDefault(); window.clearTimeout(timer); search(); });
})();
