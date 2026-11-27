/* Shared 1080x1012 Social Card layout. Geometry is identical across all team palettes. */
export function wideLayoutSvg(p) {
  const start=p.index===7?'#b88a50':p.pillB, end=p.index===7?p.light:p.head;
  return '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1012" viewBox="0 0 1080 1012">'+[
    '<defs>',
    '<linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="0"><stop stop-color="'+start+'"/><stop offset=".45" stop-color="'+p.accent+'"/><stop offset=".7" stop-color="'+end+'"/><stop offset="1" stop-color="'+p.accent+'"/></linearGradient>',
    '<linearGradient id="corner" x1="0" y1="1" x2="1" y2="0"><stop stop-color="'+start+'"/><stop offset=".6" stop-color="'+p.accent+'"/><stop offset="1" stop-color="'+end+'"/></linearGradient>',
    '<radialGradient id="ambient" cx=".8" cy=".95" r=".9"><stop stop-color="'+p.pillA+'" stop-opacity=".48"/><stop offset="1" stop-color="'+p.base+'" stop-opacity="0"/></radialGradient>',
    '<linearGradient id="photo-paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e1e5f0"/><stop offset="1" stop-color="#c8cede"/></linearGradient>',
    '<linearGradient id="silhouette" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b3b8c8"/><stop offset="1" stop-color="#9199af"/></linearGradient>',
    '</defs>',
    '<rect width="1080" height="1012" fill="'+p.base+'"/><rect width="1080" height="1012" fill="url(#ambient)"/>',
    '<path d="M497 -12Q865 -8 1092 88V151Q932 28 497 -12Z" fill="url(#ribbon)"/>',
    '<g fill="none" stroke="url(#corner)" stroke-linecap="round"><path d="M40 83V60Q40 38 62 38H89" stroke-width="8"/><path d="M566 400V360Q566 294 632 294H696" stroke-width="9"/><path d="M872 728H934Q994 728 994 668V620" stroke-width="9"/></g>',
    '<path d="M116 355H207" stroke="'+end+'" stroke-width="7" stroke-linecap="round"/>',
    '<path d="M0 325L55 267M0 354L55 296M0 383L55 325M0 412L55 354M0 441L55 383" fill="none" stroke="url(#corner)" stroke-width="8"/>',
    '<path d="M0 489L57 432V461L0 518Z" fill="'+start+'"/>',
    '<path d="M1080 379V468L963 587V497Z" fill="url(#corner)"/><path d="M1080 468V514L965 631V585Z" fill="url(#ribbon)"/>',
    '<rect x="584" y="314" width="380" height="398" rx="65" fill="url(#photo-paper)" stroke="#ffffff" stroke-width="9"/>',
    '<g fill="url(#silhouette)"><circle cx="774" cy="455" r="61"/><path d="M644 655Q651 535 774 535Q897 535 904 655Q904 659 898 659H650Q644 659 644 655Z"/></g>',
    '<path d="M0 835C104 904 231 942 437 946C252 952 121 931 0 891Z" fill="url(#ribbon)"/>',
    '<path d="M0 973C246 1027 425 946 624 925C814 904 973 917 1080 976C916 921 815 928 642 950C395 981 261 1057 0 1012Z" fill="url(#ribbon)"/>',
    '</svg>'
  ].join('');
}
