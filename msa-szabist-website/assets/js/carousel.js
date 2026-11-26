(function () {
  'use strict';
  var root = document.getElementById('directory');
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }
  function mod(value, length) { return ((value % length) + length) % length; }
  function wrap(value, length) {
    var offset = mod(value + length / 2, length) - length / 2;
    return offset === -length / 2 && value > 0 ? length / 2 : offset;
  }
  function render(members) {
    root.textContent = '';
    if (!members.length) { root.appendChild(el('p', 'state', 'Member profiles will appear here soon.')); return; }
    var slides = [], dots = [], index = 0, announced = -1;
    var position = 0, target = 0, frame = 0, lastFrame = 0, step = 1;
    var cardWidth = 1, gap = 0, sideScale = .82;
    var drag = null, suppressUntil = 0;
    // Short directories reuse off-screen copies so recycling happens outside the visible row.
    var cycleLength = members.length > 1 && members.length < 4 ? members.length * 2 : members.length;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)');
    var shell = el('div', 'carousel-shell'), stage = el('div', 'carousel-viewport');
    stage.setAttribute('role', 'region'); stage.setAttribute('aria-roledescription', 'carousel');
    stage.setAttribute('aria-label', 'Members'); stage.tabIndex = 0;
    stage.setAttribute('aria-description', 'Continuous member carousel. Scroll, drag or use Left and Right arrow keys to browse.');
    stage.title = 'Scroll or drag to browse members';
    Array.from({ length: cycleLength }).forEach(function (_, slot) {
      var memberIndex = slot % members.length, member = members[memberIndex];
      var slide = el('a', 'carousel-slide'), art = el('span', 'carousel-art'), img = el('img');
      slide.dataset.memberIndex = String(memberIndex);
      slide.href = '/profile/' + encodeURIComponent(member.slug);
      slide.setAttribute('aria-label', member.name + ', ' + (memberIndex + 1) + ' of ' + members.length);
      var asset = '/assets/members/' + encodeURIComponent(member.slug);
      const revision = member.assetVersion ? '?v=' + encodeURIComponent(member.assetVersion) : '';
      img.dataset.themeDark = asset + (member.cardThemes ? '/card-dark.png' : '/card.png') + revision;
      img.dataset.themeLight = asset + (member.cardThemes ? '/card-light.png' : '/card.png') + revision;
      img.dataset.themeFallback = asset + '/card.png' + revision;
      img.src = window.MSATheme ? window.MSATheme.source(img) : asset + '/card.png' + revision;
      img.alt = member.name + ' member card'; img.loading = slot === 0 ? 'eager' : 'lazy';
      img.decoding = 'async'; img.draggable = false;
      art.appendChild(img); slide.appendChild(art); stage.appendChild(slide); slides.push(slide);
      slide.addEventListener('click', function (event) {
        var offset = members.length === 1 ? 0 : wrap(slot - position, cycleLength);
        if (Math.abs(offset) > .025 || frame) { event.preventDefault(); moveTo(position + offset); }
      });
    });
    stage.addEventListener('click', function (event) {
      if (performance.now() < suppressUntil && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); }
    }, true);
    stage.addEventListener('dragstart', function (event) { event.preventDefault(); });
    shell.appendChild(stage); root.appendChild(shell);
    if (window.MSATheme) window.MSATheme.applyAssets(stage);
    if (members.length > 1) {
      var previous = el('button', 'carousel-arrow carousel-prev');
      var next = el('button', 'carousel-arrow carousel-next');
      previous.type = next.type = 'button';
      previous.setAttribute('aria-label', 'Previous member'); next.setAttribute('aria-label', 'Next member');
      previous.title = 'Previous member'; next.title = 'Next member';
      previous.addEventListener('click', function () { moveTo(Math.round(target) - 1); });
      next.addEventListener('click', function () { moveTo(Math.round(target) + 1); });
      shell.appendChild(previous); shell.appendChild(next);
    }
    var details = el('div', 'carousel-details'), name = el('h2', 'carousel-name');
    var role = el('p', 'carousel-role'), counter = el('p', 'carousel-counter'), live = el('p', 'visually-hidden');
    live.setAttribute('aria-live', 'polite'); live.setAttribute('aria-atomic', 'true');
    [name, role, counter, live].forEach(function (node) { details.appendChild(node); });
    var pagination = el('div', 'carousel-pagination'), progress;
    function choose(memberIndex) {
      moveTo(position + wrap(memberIndex - mod(position, members.length), members.length));
    }
    if (members.length > 7) {
      progress = el('input', 'carousel-progress'); progress.type = 'range'; progress.min = '1'; progress.max = String(members.length); progress.step = '1';
      progress.setAttribute('aria-label', 'Choose member');
      progress.addEventListener('input', function () { choose(Number(progress.value) - 1); });
      pagination.appendChild(progress);
    } else if (members.length > 1) {
      members.forEach(function (member, i) {
        var dot = el('button', 'carousel-dot'); dot.type = 'button';
        dot.setAttribute('aria-label', 'Show ' + member.name + ', ' + (i + 1) + ' of ' + members.length);
        dot.addEventListener('click', function () { choose(i); });
        pagination.appendChild(dot); dots.push(dot);
      });
    }
    if (members.length > 1) details.appendChild(pagination);
    root.appendChild(details);
    function measure() {
      var style = getComputedStyle(root);
      gap = parseFloat(style.getPropertyValue('--card-gap')) || 0;
      sideScale = parseFloat(style.getPropertyValue('--side-card-scale')) || .82;
      cardWidth = parseFloat(getComputedStyle(slides[0]).width);
      step = cardWidth * (1 + sideScale) / 2 + gap;
    }
    function scaleAt(offset) {
      var amount = Math.min(1, Math.abs(offset));
      var eased = amount * amount * (3 - 2 * amount);
      return 1 - (1 - sideScale) * eased;
    }
    function xAt(offset) {
      var fraction = position - Math.floor(position), lower = -fraction;
      var x = -fraction * step, steps = Math.round(offset - lower);
      // Pack using the actual scaled edges so the gap cannot widen during the handoff.
      if (steps > 0) {
        for (var i = 0; i < steps; i++) x += cardWidth * (scaleAt(lower + i) + scaleAt(lower + i + 1)) / 2 + gap;
      } else {
        for (var j = 0; j > steps; j--) x -= cardWidth * (scaleAt(lower + j) + scaleAt(lower + j - 1)) / 2 + gap;
      }
      return x;
    }
    function paint() {
      var nearest = Math.round(position);
      index = mod(nearest, members.length);
      var limit = Math.min(2, cycleLength / 2);
      slides.forEach(function (slide, slot) {
        var offset = members.length === 1 ? 0 : wrap(slot - position, cycleLength);
        var distance = Math.abs(offset), hidden = members.length > 1 && distance >= limit;
        var accessible = !hidden && Math.abs(wrap(slot - nearest, cycleLength)) <= 1;
        var fade = Math.max(0, Math.min(1, (distance - .55) / .45));
        var visibility = distance <= 1 ? 1 : Math.max(0, (limit - distance) / (limit - 1));
        slide.style.setProperty('--offset', offset);
        slide.style.setProperty('--x', xAt(offset) + 'px');
        slide.style.setProperty('--scale', scaleAt(offset));
        slide.style.setProperty('--fade-direction', offset < 0 ? 'to right' : 'to left');
        slide.style.setProperty('--opacity', 1 - .3 * fade);
        slide.style.setProperty('--fade', fade);
        slide.style.setProperty('--visibility', visibility);
        slide.className = 'carousel-slide' + (slot === mod(nearest, cycleLength) ? ' is-active' : hidden ? ' is-hidden' : ' is-neighbour');
        slide.tabIndex = accessible ? 0 : -1; slide.setAttribute('aria-hidden', String(!accessible));
        if (!accessible && document.activeElement === slide) stage.focus({ preventScroll: true });
        if (distance < 1.5) slide.querySelector('img').loading = 'eager';
      });
      if (announced === index) return;
      announced = index;
      name.textContent = members[index].name; role.textContent = members[index].role || '';
      counter.textContent = (index + 1) + ' / ' + members.length;
      live.textContent = name.textContent + (role.textContent ? ', ' + role.textContent : '') + ', ' + counter.textContent;
      dots.forEach(function (dot, i) { dot.setAttribute('aria-current', String(i === index)); });
      if (progress) { progress.value = index + 1; progress.setAttribute('aria-valuetext', members[index].name + ', ' + counter.textContent); }
    }
    function stopMotion() {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0; lastFrame = 0; target = position;
    }
    function glide(time) {
      var elapsed = lastFrame ? Math.min(40, time - lastFrame) : 16;
      lastFrame = time;
      var difference = target - position;
      var movement = difference * (1 - Math.exp(-elapsed / 65));
      var maxMovement = .12 * elapsed / 16.67;
      position += reducedMotion.matches ? difference : Math.max(-maxMovement, Math.min(maxMovement, movement));
      var settled = Math.abs(target - position) < .0001;
      if (settled) position = target;
      paint();
      if (settled) { frame = 0; lastFrame = 0; }
      else frame = window.requestAnimationFrame(glide);
    }
    function moveTo(next) {
      if (members.length < 2) return;
      target = next;
      if (reducedMotion.matches) { stopMotion(); position = target = next; paint(); }
      else if (!frame) frame = window.requestAnimationFrame(glide);
    }
    stage.addEventListener('wheel', function (event) {
      if (event.ctrlKey || drag || members.length < 2) return;
      var delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;
      if (event.deltaMode === 1) delta *= 16;
      else if (event.deltaMode === 2) delta *= step;
      event.preventDefault(); moveTo(target + delta / step);
    }, { passive: false });
    shell.addEventListener('keydown', function (event) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault(); moveTo(Math.round(target) + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    stage.addEventListener('pointerdown', function (event) {
      if (!event.isPrimary || event.button !== 0 || !event.target.closest('.carousel-slide')) return;
      stopMotion(); suppressUntil = 0;
      drag = { id: event.pointerId, start: position, x: event.clientX, y: event.clientY, lastX: event.clientX, lastTime: event.timeStamp, velocity: 0, horizontal: false };
    });
    stage.addEventListener('pointermove', function (event) {
      if (!drag || event.pointerId !== drag.id) return;
      var dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (!drag.horizontal && Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
      if (!drag.horizontal && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
        drag.horizontal = true; stage.setPointerCapture(event.pointerId); stage.classList.add('is-dragging');
      }
      if (!drag.horizontal) return;
      var elapsed = event.timeStamp - drag.lastTime;
      if (elapsed > 0) { drag.velocity = (event.clientX - drag.lastX) / elapsed; drag.lastX = event.clientX; drag.lastTime = event.timeStamp; }
      position = target = members.length > 1 ? drag.start - dx / step : 0;
      paint();
    });
    function endDrag(event, cancelled) {
      if (!drag || event.pointerId !== drag.id) return;
      var horizontal = drag.horizontal;
      var velocity = event.timeStamp - drag.lastTime < 100 ? drag.velocity : 0;
      drag = null; stage.classList.remove('is-dragging');
      if (horizontal) {
        suppressUntil = performance.now() + 400;
        var momentum = cancelled ? 0 : Math.max(-.5, Math.min(.5, -velocity * 160 / step));
        moveTo(position + momentum);
      }
    }
    stage.addEventListener('pointerup', function (event) { endDrag(event, false); });
    stage.addEventListener('pointercancel', function (event) { endDrag(event, true); });
    stage.addEventListener('lostpointercapture', function (event) { if (event.target === stage) endDrag(event, true); });
    window.addEventListener('resize', function () { measure(); paint(); });
    measure(); paint();
  }
  fetch('/data/members.json', { cache: 'no-store' })
    .then(function (response) { if (!response.ok) throw new Error(response.status); return response.json(); })
    .then(function (data) { render(Array.isArray(data.members) ? data.members : []); })
    .catch(function () { root.textContent = ''; root.appendChild(el('p', 'state', 'Could not load members. Please refresh the page.')); });
  var year = document.getElementById('year'); if (year) year.textContent = new Date().getFullYear();
})();
