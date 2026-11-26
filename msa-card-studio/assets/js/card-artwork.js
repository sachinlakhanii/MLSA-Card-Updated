/* Artwork only: shared by preview, exports and server-generated verification backs. */
import { palettes, icons } from './card-palettes.js';
import { artAssets } from './card-art-assets.js';
import { wideArt } from './wide-art.js';

export const PORTRAIT_SCALE = 1080 / 638;
export const PORTRAIT_GAP = 1700 / PORTRAIT_SCALE - 982;
export const xml = value => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const normalized = value => String(value || '').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]/g,'').replace(/operations/g,'operation').replace(/team$/,'');
export function teamIndex(value) {
  const name = normalized(value);
  const aliases = [['technical','tech','technology'],['outreach'],['eventsandoperation','eventsoperation','eventandoperation','eventsandops','eventsops','eando','events','operation'],['marketing'],['socialmedia','social'],['sponsorship','sponsorships','sponsors'],['designandcontent','designcontent','design','content'],['mlsaszabist','mlsaszabistislamabad','core','mlsa']];
  const index = aliases.findIndex(names => names.includes(name));
  return index < 0 ? 7 : index;
}
export function paletteFor(team, theme = 'dark') {
  const index = teamIndex(team), p = palettes[index];
  const dark = ['#064a80','#00675e','#58208d','#930b4b','#49309b','#78560b','#a30d17','#185e26'][index];
  return {...p,index,text:theme==='light'?'#122137':'#f8f8fc',muted:theme==='light'?'#43566d':'#d7def0',ink:theme==='light'?dark:p.accent,base:theme==='light'?'#f8fafc':['#031736','#002b2e','#200a3c','#360018','#100d36','#031a36','#090909','#002d10'][index],pale:['#e4f3ff','#e1f7f2','#f0e7fb','#fce7f0','#eee8fc','#fbf2dc','#fbe8e9','#edf5df'][index]};
}
export function iconSvg(name, color = 'currentColor') {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="'+color+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(icons[name]||icons.star).replace(/#fff/g,color)+'</svg>';
}
const image = (uri,x,y,w,h,extra='') => '<image href="'+uri+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" preserveAspectRatio="xMidYMid meet" '+extra+'/>';
export function buildingArtwork(ink='#ffffff') {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="335" height="133" viewBox="0 0 335 133"><defs><mask id="lines">'+image(artAssets.building,0,0,335,133)+'</mask></defs><rect width="335" height="133" fill="'+ink+'" mask="url(#lines)"/></svg>';
}
export function wideDecoration(team, theme) {
  const p = paletteFor(team,theme);
  const paper=theme==='light'?'<defs><linearGradient id="wide-paper" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="'+p.pale+'"/></linearGradient></defs><rect width="1080" height="1012" fill="url(#wide-paper)"/>':'';
  return wideArt.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ').replace('viewBox="0 0 1080 1080" width="1080" height="1080"','viewBox="0 0 1080 1012" width="1080" height="1012"')
    .replace('<defs>',paper+'<defs>')
    .replace(/id="(gx|glow|gx0|gx1|gx2|frameArt)"/g,'id="wide-$1"').replace(/url\(#(gx|glow)\)/g,'url(#wide-$1)')
    .replace(/data-s="([al])"/g,(_,v)=>'stroke="'+(v==='a'?p.ink:(theme==='light'?p.accent:p.light))+'"')
    .replace(/data-f="([al])"/g,(_,v)=>'fill="'+(v==='a'?p.ink:(theme==='light'?p.accent:p.light))+'"')
    .replace(/<stop id="wide-gx([012])"/g,(_,n)=>'<stop stop-color="'+(n==='1'?p.ink:(theme==='light'?p.accent:p.light))+'" id="wide-gx'+n+'"')
    .replace(/<path d="M-30 (905|952)/g,'<path transform="translate(0 -68)" d="M-30 $1')
    .replace('id="wide-frameArt"','id="wide-frameArt" transform="translate(0 -16)"');
}
export function portraitGeometry(team) {
  const g = artAssets.geometry[teamIndex(team)], s=PORTRAIT_SCALE, gap=PORTRAIT_GAP;
  return {photo:[g.photo[0]*s,(g.photo[1]+gap)*s,(g.photo[2]-g.photo[0])*s,(g.photo[3]-g.photo[1])*s],name:[g.nameC[0]*s,(g.nameC[1]+gap)*s],role:[g.roleC[0]*s,(g.roleC[1]+gap)*s],qr:[(g.qr[0]+g.qr[2])/2*s,((g.qr[1]+g.qr[3])/2+gap)*s]};
}
function sourceArtwork(uri,side,index) {
  // Insert height only in the plain gradient between header and photo; content stays proportional.
  const gap=PORTRAIT_GAP, cut=side==='back'?(index===7?340:245):210;
  return '<defs><clipPath id="top"><rect width="638" height="'+cut+'"/></clipPath><clipPath id="bottom"><rect y="'+cut+'" width="638" height="'+(982-cut)+'"/></clipPath></defs>'+image(uri,0,0,638,982,'clip-path="url(#top)"')+'<svg y="'+cut+'" width="638" height="'+gap+'" viewBox="0 '+(cut-1)+' 638 1" preserveAspectRatio="none">'+image(uri,0,0,638,982)+'</svg><g transform="translate(0 '+gap+')">'+image(uri,0,0,638,982,'clip-path="url(#bottom)"')+'</g>';
}
function livePill(p, y) {
  // Fully cover the original baked pill, including its label. Reuse supplied SVG team icons.
  return '<rect x="125" y="'+y+'" width="392" height="63" rx="31.5" fill="'+p.base+'"/><rect x="135" y="'+(y+4)+'" width="365" height="55" rx="27.5" fill="url(#pill)" stroke="'+(p.text)+'" stroke-width="2"/><svg x="151" y="'+(y+15)+'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="'+p.text+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+icons[p.icon[0]].replace(/#fff/g,p.text)+'</svg>';
}
function lightArtwork(p,side) {
  const g=artAssets.geometry[p.index], gap=PORTRAIT_GAP;
  const lightBase='<defs><linearGradient id="paper" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="'+p.pale+'"/></linearGradient><linearGradient id="ribbon"><stop stop-color="'+p.ink+'"/><stop offset="1" stop-color="'+p.accent+'"/></linearGradient><mask id="building">'+image(artAssets.building,157,820+gap,340,135)+'</mask></defs><rect width="638" height="1005" fill="url(#paper)"/><g fill="none" stroke="url(#ribbon)"><path d="M425 -10Q560 35 650 160" stroke-width="22"/><path d="M-20 889Q200 1000 390 948T670 940" stroke-width="15"/><path d="M-20 930Q210 1020 430 980T660 980" stroke-width="5"/></g>';
  if(side==='back') {
    const center=portraitGeometry(p.name).qr.map(v=>v/PORTRAIT_SCALE), x=center[0]-172,y=center[1]-163;
    const lineY=p.index===7?830:720, panelY=p.index===7?845:777, sourceY=p.index===7?790:745;
    return lightBase+'<text x="319" y="140" text-anchor="middle" font-family="Georgia,serif" font-size="70" fill="'+p.text+'">MLSA</text><text x="319" y="200" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="700" letter-spacing="4" fill="'+p.ink+'">SZABIST ISLAMABAD</text><path d="M'+(x+55)+' '+y+'H'+(x+20)+'Q'+x+' '+y+' '+x+' '+(y+20)+'V'+(y+50)+'M'+(x+289)+' '+y+'H'+(x+324)+'Q'+(x+344)+' '+y+' '+(x+344)+' '+(y+20)+'V'+(y+50)+'M'+x+' '+(y+270)+'V'+(y+305)+'Q'+x+' '+(y+325)+' '+(x+20)+' '+(y+325)+'H'+(x+55)+'M'+(x+344)+' '+(y+270)+'V'+(y+305)+'Q'+(x+344)+' '+(y+325)+' '+(x+324)+' '+(y+325)+'H'+(x+289)+'" fill="none" stroke="url(#ribbon)" stroke-width="10" stroke-linecap="round"/><text x="319" y="'+(y+375)+'" text-anchor="middle" font-family="Arial,sans-serif" font-size="36" font-weight="700" fill="'+p.text+'">Scan to Verify</text><path d="M40 '+lineY+'H598" stroke="'+p.ink+'"/><rect x="65" y="'+panelY+'" width="510" height="105" rx="18" fill="#061c36"/><svg x="65" y="'+panelY+'" width="510" height="105" viewBox="65 '+sourceY+' 510 105">'+image(artAssets.back[p.index],0,0,638,982)+'</svg>';
  }
  const sideIcons='<defs><filter id="whiteIcons" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="discrete" tableValues="0 0 0 0 1"/><feFuncG type="discrete" tableValues="0 0 0 0 1"/><feFuncB type="discrete" tableValues="0 0 0 0 1"/></feComponentTransfer></filter><mask id="sideIcons">'+image(artAssets.front[p.index],0,gap,638,982,'filter="url(#whiteIcons)"')+'</mask><clipPath id="iconWindows"><rect x="55" y="'+(708+gap)+'" width="65" height="65"/><rect x="522" y="'+(708+gap)+'" width="65" height="65"/></clipPath></defs><rect width="638" height="1005" fill="'+p.ink+'" mask="url(#sideIcons)" clip-path="url(#iconWindows)"/>';
  return lightBase+'<g stroke="url(#ribbon)" stroke-width="5"><path d="M0 415L75 320M0 445L75 350M0 475L75 380M0 505L75 410"/><path d="M-10 850L110 730M480 450L650 285" stroke-width="30"/></g>'+image(artAssets.shield,60,35,146,161)+'<path d="M244 65V170" stroke="'+p.ink+'" stroke-width="3"/><g font-family="Arial,sans-serif" fill="'+p.text+'"><text x="267" y="89" font-size="30">Microsoft Learn</text><text x="267" y="125" font-size="30">Student Ambassadors</text><text x="267" y="165" font-size="28" font-weight="700" fill="'+p.ink+'">SZABIST ISLAMABAD</text></g><rect x="'+(g.photo[0]-7)+'" y="'+(g.photo[1]+gap-7)+'" width="'+(g.photo[2]-g.photo[0]+14)+'" height="'+(g.photo[3]-g.photo[1]+14)+'" rx="58" fill="'+p.pale+'" stroke="'+p.ink+'" stroke-width="5"/><path d="M84 '+(620+gap)+'H608Q617 '+(620+gap)+' 610 '+(630+gap)+'L570 '+(692+gap)+'Q567 '+(699+gap)+' 555 '+(699+gap)+'H38Q28 '+(699+gap)+' 35 '+(688+gap)+'L75 '+(628+gap)+'Z" fill="#ffffff" stroke="'+p.ink+'" stroke-opacity=".2"/><rect x="155" y="'+(820+gap)+'" width="345" height="140" mask="url(#building)" fill="'+p.ink+'"/>'+sideIcons;
}
export function portraitArtwork(team, theme='dark', side='front') {
  const p=paletteFor(team,theme), h=1700/PORTRAIT_SCALE;
  return '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1700" viewBox="0 0 638 '+h+'"><defs><linearGradient id="pill"><stop stop-color="'+(theme==='light'?p.pale:p.pillA)+'"/><stop offset="1" stop-color="'+(theme==='light'?'#ffffff':p.pillB)+'"/></linearGradient></defs>'+(theme==='light'?lightArtwork(p,side):sourceArtwork(artAssets[side][p.index],side,p.index))+(side==='front'?livePill(p,705+PORTRAIT_GAP):'')+'</svg>';
}
