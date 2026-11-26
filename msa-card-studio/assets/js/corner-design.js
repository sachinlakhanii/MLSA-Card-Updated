/* Shared corner geometry. Keep SVG backs and HTML fronts identical. */
export function cornerDots(width, flip = false) {
  const scale = width / 150, dots = [];
  for (let i = 0; i < 15; i++) for (let j = 0; j < 15; j++) {
    const opacity = 0.91 - 0.0586 * (i + j);
    if (opacity < 0.08) continue;
    const radius = (0.77 + (opacity - 0.09) * (4.51 / 0.82)) * scale;
    let x = 145 - i * 10, y = 5 + j * 10;
    if (flip) { x = 150 - x; y = 150 - y; }
    dots.push({x:x*scale, y:y*scale, radius, opacity});
  }
  return dots;
}
export function cornerSvg(layout, color, height) {
  const portrait = layout === 'badge', width = portrait ? 220 : 150;
  const circles = flip => cornerDots(width, flip).map(dot => '<circle cx="'+dot.x.toFixed(3)+'" cy="'+dot.y.toFixed(3)+'" r="'+dot.radius.toFixed(3)+'" opacity="'+dot.opacity.toFixed(2)+'"/>').join('');
  const brackets = portrait
    ? 'M95 42.5H56Q40.5 42.5 40.5 58V97M981 '+(height-48.5)+'H1020Q1035.5 '+(height-48.5)+' 1035.5 '+(height-64)+'V'+(height-103)
    : 'M76 30H42Q30 30 30 42V76M1004 '+(height-30)+'H1038Q1050 '+(height-30)+' 1050 '+(height-42)+'V'+(height-76);
  return '<g fill="'+color+'"><g data-corner="top-right" transform="translate('+(1080-width)+' 0)">'+circles(false)+'</g><g data-corner="bottom-left" transform="translate(0 '+(height-width)+')">'+circles(true)+'</g></g><path data-corner="brackets" d="'+brackets+'" fill="none" stroke="'+color+'" stroke-width="'+(portrait?5:4)+'"/>';
}
