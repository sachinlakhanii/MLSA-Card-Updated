/* Shared colour preference and real image variants. Runs before CSS to avoid a theme flash. */
(function () {
  'use strict';
  var root = document.documentElement, preference = window.matchMedia('(prefers-color-scheme:dark)');
  var key = 'msaSiteTheme', selected;
  function stored() { try { var value = localStorage.getItem(key); return value === 'dark' || value === 'light' ? value : null; } catch (error) { return null; } }
  function current() { return root.dataset.theme || (preference.matches ? 'dark' : 'light'); }
  root.dataset.theme = stored() || (preference.matches ? 'dark' : 'light');
  function source(node) { return node.getAttribute('data-theme-' + current()); }
  function applyAssets(scope) {
    (scope || document).querySelectorAll('[data-theme-dark][data-theme-light]').forEach(function (node) {
      var value = source(node);
      if (!value) return;
      if (node.tagName === 'IMG') {
        if (!node.dataset.themeBound) {
          node.dataset.themeBound = 'true';
          node.addEventListener('error', function () {
            var fallback = node.getAttribute('data-theme-fallback');
            if (fallback && node.getAttribute('src') !== fallback) node.src = fallback;
          });
        }
        if (node.getAttribute('src') !== value) node.src = value;
      } else if (node.tagName === 'A') node.href = value;
    });
  }
  function icon(dark) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '1.8'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', dark ? 'M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z' : 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5'); svg.appendChild(path);
    if (!dark) { var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); circle.setAttribute('cx', '12'); circle.setAttribute('cy', '12'); circle.setAttribute('r', '4'); svg.appendChild(circle); }
    return svg;
  }
  function updateButtons() {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      var dark = current() === 'dark';
      button.querySelector('[data-theme-icon]').replaceChildren(icon(dark));
      button.querySelector('[data-theme-label]').textContent = dark ? 'Dark' : 'Light';
      button.setAttribute('aria-label', 'Switch to ' + (dark ? 'light' : 'dark') + ' theme');
      button.title = button.getAttribute('aria-label'); button.hidden = false;
    });
  }
  function set(theme, persist) {
    if (theme !== 'dark' && theme !== 'light') return;
    root.dataset.theme = theme;
    if (persist) { selected = theme; try { localStorage.setItem(key, theme); } catch (error) { /* preference still works on this page */ } }
    applyAssets(); updateButtons();
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
  }
  window.MSATheme = { current: current, source: source, applyAssets: applyAssets, set: function (theme) { set(theme, true); } };
  selected = stored();
  function init() {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) { button.addEventListener('click', function () { set(current() === 'dark' ? 'light' : 'dark', true); }); });
    applyAssets(); updateButtons();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  preference.addEventListener('change', function () { if (!selected) set(preference.matches ? 'dark' : 'light', false); });
  window.addEventListener('storage', function (event) { if (event.key === key) { selected = stored(); set(selected || (preference.matches ? 'dark' : 'light'), false); } });
})();
