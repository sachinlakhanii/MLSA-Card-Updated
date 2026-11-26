/* Progressive profile enhancements. All member content remains in the static HTML. */
(function () {
  'use strict';
  var page = document.querySelector('.profile-page');
  if (!page) return;
  page.classList.add('is-enhanced');
  var status = document.getElementById('profileStatus'), statusTimer;
  function notify(message) {
    window.clearTimeout(statusTimer);
    status.textContent = message; status.dataset.visible = 'true';
    statusTimer = window.setTimeout(function () { status.dataset.visible = 'false'; }, 2800);
  }
  async function copy(text, message) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        var input = document.createElement('textarea');
        input.value = text; input.readOnly = true;
        input.style.cssText = 'position:fixed;left:-10000px;top:0';
        page.appendChild(input); input.select();
        try { if (!document.execCommand('copy')) throw new Error('Copy unavailable'); }
        finally { input.remove(); }
      }
      notify(message);
    } catch (error) { notify('Could not copy. Select the text and copy it manually.'); }
  }
  var copyLink = document.querySelector('[data-copy-link]');
  if (copyLink) copyLink.addEventListener('click', function () { copy(window.location.origin + window.location.pathname, 'Profile link copied'); });

  var dialog = document.getElementById('cardDialog'), opener;
  if (dialog && typeof dialog.showModal === 'function') {
    document.querySelectorAll('[data-open-card]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); opener = link;
        dialog.showModal(); page.classList.add('modal-open');
      });
    });
    dialog.querySelector('[data-close-card]').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (event) {
      var bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
    dialog.addEventListener('close', function () { page.classList.remove('modal-open'); if (opener) opener.focus({ preventScroll: true }); });
  }
  var photo = document.querySelector('.photo');
  if (photo) {
    function fallback() { photo.hidden = true; }
    photo.addEventListener('error', fallback);
    if (photo.complete && !photo.naturalWidth) fallback();
  }
  var reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.remove('is-waiting'); observer.unobserve(entry.target); }
      });
    }, { threshold: .06 });
    document.querySelectorAll('.profile-reveal').forEach(function (section) { section.classList.add('is-waiting'); observer.observe(section); });
    page.addEventListener('focusin', function (event) {
      var section = event.target.closest('.is-waiting');
      if (section) { section.classList.remove('is-waiting'); observer.unobserve(section); }
    });
  }
})();
