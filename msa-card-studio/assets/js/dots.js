/* Front dots use the same geometry as the verification back. */
import { cornerDots } from './corner-design.js';
function draw(el, flip) {
  el.innerHTML = cornerDots(Number(el.dataset.w), flip).map(dot => {
    const d = (2 * dot.radius).toFixed(2);
    return '<div style="position:absolute;left:'+(dot.x-dot.radius).toFixed(2)+'px;top:'+(dot.y-dot.radius).toFixed(2)+'px;width:'+d+'px;height:'+d+'px;border-radius:50%;background:currentColor;opacity:'+dot.opacity.toFixed(2)+'"></div>';
  }).join('');
}

export function initDots() {
  [['dotsTR', false], ['dotsBL', true], ['dotsTR2', false], ['dotsBL2', true]].forEach(([id, flip]) => {
    const el = document.getElementById(id);
    if (el) draw(el, flip);
  });
}
