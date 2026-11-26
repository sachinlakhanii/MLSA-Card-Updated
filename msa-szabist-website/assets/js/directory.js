/* Builds the member directory on the home page from /data/members.json */
(function () {
  'use strict';

  var root = document.getElementById('directory');
  var DEFAULT_TEAM = 'Core Team';

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function initials(name) {
    return name.split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
  }

  function memberCard(m) {
    var li = el('li');
    var a = el('a', 'member');
    a.href = '/profile/' + encodeURIComponent(m.slug);
    var avatar;
    if (m.photo) {
      avatar = el('img', 'avatar');
      avatar.src = '/assets/members/' + encodeURIComponent(m.slug) + '/photo.jpg';
      avatar.alt = m.name;
      avatar.loading = 'lazy';
    } else {
      avatar = el('div', 'avatar', initials(m.name));
      avatar.setAttribute('aria-hidden', 'true');
    }
    a.appendChild(avatar);
    a.appendChild(el('p', 'name', m.name));
    if (m.role) a.appendChild(el('p', 'role', m.role));
    li.appendChild(a);
    return li;
  }

  function render(members) {
    root.textContent = '';
    if (!members.length) {
      root.appendChild(el('p', 'state', 'Member profiles will appear here soon.'));
      return;
    }
    var groups = {};
    members.forEach(function (m) {
      var t = m.team || DEFAULT_TEAM;
      (groups[t] = groups[t] || []).push(m);
    });
    Object.keys(groups).sort().forEach(function (team) {
      var section = el('section', 'team');
      section.appendChild(el('h2', '', team));
      var list = el('ul', 'grid');
      groups[team]
        .sort(function (a, b) { return a.name.localeCompare(b.name); })
        .forEach(function (m) { list.appendChild(memberCard(m)); });
      section.appendChild(list);
      root.appendChild(section);
    });
  }

  fetch('/data/members.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) { render(Array.isArray(data.members) ? data.members : []); })
    .catch(function () {
      root.textContent = '';
      root.appendChild(el('p', 'state', 'Could not load members. Please refresh the page.'));
    });

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
