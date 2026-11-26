import { state } from './state.js';
import { paletteFor, portraitArtwork, portraitGeometry, wideDecoration, iconSvg, buildingArtwork } from './card-artwork.js';

export function applyCardArtwork(card,layout,theme,team) {
  const p=paletteFor(team,theme), light=theme==='light';
  card.style.setProperty('--design-ink',p.ink);
  card.style.setProperty('--design-text',p.text);
  card.style.setProperty('--design-muted',p.muted);
  card.style.setProperty('--design-pill',light?'linear-gradient(90deg,'+p.pale+',#ffffff)':'linear-gradient(90deg,'+p.pillA+','+p.pillB+')');
  card.style.setProperty('--design-background',light?'radial-gradient(ellipse at 72% 38%,'+p.pale+',transparent 68%),linear-gradient(160deg,#fff,'+p.pale+')':p.bg);
  const building=card.querySelector('.design-building');
  if(building) building.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(buildingArtwork(light?p.ink:'#ffffff'));
  const art=card.querySelector('.design-art');
  if(art) art.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(layout==='wide'?wideDecoration(team,theme):portraitArtwork(team,theme));
  if(layout==='wide') {
    const icon=card.querySelector('.team-icon');
    icon.innerHTML=p.icon.map(name=>iconSvg(name)).join('');
    icon.classList.toggle('with-divider',p.sep);
    icon.style.width=(p.icon.length*42+(p.icon.length-1)*8+(p.sep?14:0))+'px';
    const pill='<svg xmlns="http://www.w3.org/2000/svg" width="439" height="68"><defs><linearGradient id="fill"><stop stop-color="'+(light?p.pale:p.pillA)+'"/><stop offset="1" stop-color="'+(light?'#ffffff':p.pillB)+'"/></linearGradient></defs><rect x="1.5" y="1.5" width="436" height="65" rx="32.5" fill="url(#fill)" stroke="'+p.text+'" stroke-width="3"/></svg>';
    card.querySelector('.team-pill-art').src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(pill);
  }
  else {
    const g=portraitGeometry(team), photo=card.querySelector('.photo-slot');
    for(const [key,value] of Object.entries({left:g.photo[0],top:g.photo[1],width:g.photo[2],height:g.photo[3]})) photo.style[key]=value+'px';
    for(const [selector,point] of [['.o-name',g.name],['.o-role',g.role]]) {
      const node=card.querySelector(selector);node.style.left=point[0]+'px';node.style.top=point[1]+'px';
    }
  }
}
export function fitCardText(card) {
  const cv=document.createElement('canvas'), ctx=cv.getContext('2d');
  const wide=card.classList.contains('card-wide');
  for(const [selector,base,min,max,lines] of wide?[['.o-name',72,30,410,2],['.o-role',32,18,430,2],['.o-team',32,16,335,1]]:[['.o-name',62,27,820,1],['.o-role',32,18,760,1],['.o-team',43,20,470,1]]) {
    const node=card.querySelector(selector);if(!node)continue;
    const weight=selector==='.o-role'?600:700;
    let size=base;
    const available=wide&&selector==='.o-team'?Math.min(max,439-42-14-parseFloat(card.querySelector('.team-icon').style.width||'42')):max;
    const fits=()=>{ctx.font=weight+' '+size+'px Montserrat'; const words=node.textContent.trim().split(/\s+/);let count=1,line='';for(const word of words){if(ctx.measureText(word).width>available)return false;const candidate=line?line+' '+word:word;if(ctx.measureText(candidate).width>available){count++;line=word;}else line=candidate;}return count<=lines;};
    while(size>min&&!fits())size--;
    if(lines===1&&!fits())size=Math.max(8,Math.floor(size*available/ctx.measureText(node.textContent).width));
    node.style.fontSize=size+'px';
  }
}
export function refreshCardArtwork() {
  const theme=state.light?'light':'dark',team=document.getElementById('fTeam').value;
  for(const [id,layout] of [['card','wide'],['card2','badge']]) {const card=document.getElementById(id);applyCardArtwork(card,layout,theme,team);fitCardText(card);}
}
export function initPresentation() {
  for(const id of ['fName','fRole','fTeam'])document.getElementById(id).addEventListener('input',refreshCardArtwork);
  document.addEventListener('card-theme-change',refreshCardArtwork);
  document.addEventListener('new-member',refreshCardArtwork);
  refreshCardArtwork();
  document.fonts?.ready.then(refreshCardArtwork);
}
