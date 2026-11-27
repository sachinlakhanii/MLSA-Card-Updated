/* Self-contained verification artwork, shared by browser previews and publishing. */
import qrcode from '../vendor/qrcode/qrcode.js';
import { portraitArtwork, portraitGeometry, paletteFor } from './card-artwork.js';
const escape = value => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]));
export function profileUrl(site, slug) {
  const base = new URL(site);
  if (!['https:', 'http:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new Error('Invalid website address.');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 60) throw new Error('Enter a valid profile username.');
  return base.href.replace(/\/+$/, '') + '/profile/' + slug;
}
export function qrMatrix(url) {
  const qr = qrcode(0, 'M');
  qr.addData(url, 'Byte'); qr.make();
  const size = qr.getModuleCount();
  return Array.from({length:size}, (_, y) => Array.from({length:size}, (_, x) => qr.isDark(y, x)));
}
export function cardBackSvg({name, team='', url, layout='badge', theme='dark'}) {
  if (layout !== 'badge') throw new Error('Verification backs are available for Portrait cards only.');
  theme = 'dark'; // Card artwork stays dark regardless of legacy member or website theme.
  const p=paletteFor(team,theme), matrix=qrMatrix(url), quiet=4, modules=matrix.length+quiet*2;
  const [cx,cy]=portraitGeometry(team).qr, size=p.index===7?480:460;
  let path='';
  matrix.forEach((row,y)=>row.forEach((dark,x)=>{if(dark)path+='M'+(x+quiet)+','+(y+quiet)+'h1v1h-1z';}));
  const background=portraitArtwork(team,theme,'back').replace('<svg xmlns=','<svg x="0" y="0" xmlns=');
  return '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1700" viewBox="0 0 1080 1700" role="img" aria-label="Verification back for '+escape(name||'Member Name')+'"><title>Scan to verify '+escape(name||'Member Name')+'</title>'+background+
    '<rect x="'+(cx-size/2)+'" y="'+(cy-size/2)+'" width="'+size+'" height="'+size+'" rx="'+(p.index===7?0:20)+'" fill="#FFFFFF"/>'+
    '<svg x="'+(cx-size/2+8)+'" y="'+(cy-size/2+8)+'" width="'+(size-16)+'" height="'+(size-16)+'" viewBox="0 0 '+modules+' '+modules+'" shape-rendering="crispEdges"><rect width="'+modules+'" height="'+modules+'" fill="#FFFFFF"/><path d="'+path+'" fill="#0B172F"/></svg></svg>';
}
