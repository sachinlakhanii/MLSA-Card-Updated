import { state } from './state.js';
import { paletteFor, portraitArtwork, portraitGeometry, wideDecoration, iconSvg, buildingArtwork } from './card-artwork.js';
import { eighthMedalIcon } from './eighth-artwork.js';

export function applyCardArtwork(card,layout,theme,team) {
  const p=paletteFor(team,theme), light=theme==='light';
  card.classList.toggle('is-eighth',p.index===7);
  card.style.setProperty('--design-ink',p.ink);
  card.style.setProperty('--design-heading',p.head);
  card.style.setProperty('--design-text',p.text);
  card.style.setProperty('--design-muted',p.muted);
  card.style.setProperty('--design-pill',light?'linear-gradient(90deg,'+p.pale+',#ffffff)':'linear-gradient(90deg,'+p.pillA+','+p.pillB+')');
  card.style.setProperty('--design-background',light?'radial-gradient(ellipse at 72% 38%,'+p.pale+',transparent 68%),linear-gradient(160deg,#fff,'+p.pale+')':p.bg);
  const building=card.querySelector('.design-building');
  if(building) building.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(buildingArtwork(light?p.ink:p.index===7?p.text:'#ffffff'));
  const art=card.querySelector('.design-art');
  if(art) art.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(layout==='wide'?wideDecoration(team,theme):portraitArtwork(team,theme));
  if(layout==='wide') {
    const icon=card.querySelector('.team-icon');
    icon.innerHTML=p.icon.map(name=>iconSvg(name)).join('');
    icon.classList.toggle('with-divider',p.sep);
    icon.style.width=(p.icon.length*42+(p.icon.length-1)*8+(p.sep?14:0))+'px';
    if(p.index===7) {icon.innerHTML=eighthMedalIcon();icon.style.width='64px';}
    const context=document.createElement('canvas').getContext('2d');
    context.font='700 36px Montserrat';
    const text=card.querySelector('.o-team').textContent.trim();
    const width=Math.max(370,Math.min(440,Math.ceil(context.measureText(text).width)+56+parseFloat(icon.style.width))),height=64;
    card.style.setProperty('--wide-pill-width',width+'px');
    const pill='<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'"><defs><linearGradient id="fill"><stop stop-color="'+(p.index===7?'#fff0d2':light?p.pale:p.pillA)+'"/><stop offset="1" stop-color="'+(p.index===7?'#ebc58f':light?'#ffffff':p.pillB)+'"/></linearGradient></defs><rect x="1.5" y="1.5" width="'+(width-3)+'" height="'+(height-3)+'" rx="'+((height-3)/2)+'" fill="url(#fill)" stroke="'+p.text+'" stroke-width="3"/></svg>';
    card.querySelector('.team-pill-art').src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(pill);
  }
  else {
    for(const [selector,id] of [['.o-name','fName'],['.o-role','fRole']]) {
      const node=card.querySelector(selector),value=document.getElementById(id).value.trim();
      node.textContent=p.index===7&&/^\[.*\]$/.test(value)?value.slice(1,-1):(value||'\u00A0');
    }
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
  for(const [selector,base,min,max,lines] of wide?[['.o-name',72,30,410,2],['.o-role',32,18,430,2],['.o-team',36,16,335,1]]:[['.o-name',62,27,820,1],['.o-role',32,18,760,1],['.o-team',43,20,470,1]]) {
    const node=card.querySelector(selector);if(!node)continue;
    const weight=selector==='.o-role'?600:700;
    let size=!wide&&card.classList.contains('is-eighth')?({'.o-name':84,'.o-role':56,'.o-team':52}[selector]||base):base;
    const pillWidth=parseFloat(card.style.getPropertyValue('--wide-pill-width'))||370;
    const available=wide&&selector==='.o-team'?Math.min(max,pillWidth-42-14-parseFloat(card.querySelector('.team-icon').style.width||'42')):max;
    const fits=()=>{ctx.font=weight+' '+size+'px Montserrat'; const words=node.textContent.trim().split(/\s+/);let count=1,line='';for(const word of words){if(ctx.measureText(word).width>available)return false;const candidate=line?line+' '+word:word;if(ctx.measureText(candidate).width>available){count++;line=word;}else line=candidate;}return count<=lines&&(!wide||selector!=='.o-role'||count*size*1.2<=56);};
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
