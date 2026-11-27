/* Maroon-and-champagne MLSA artwork. Member text and QR modules remain live layers. */
import { szabistBackLogo } from './partner-logo.js';
export function eighthMedalIcon() {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 56" fill="none"><path d="M9 32L3 55L17 48L25 56L29 35M29 34L35 54L39 46L47 49L38 29" fill="currentColor"/><path d="M24 2L30 7L38 6L40 14L46 20L41 27L40 35L32 37L25 43L18 38L10 38L8 30L2 24L7 17L8 9L16 7Z" fill="currentColor"/><circle cx="24" cy="22" r="12" stroke="#f6e4c8" stroke-width="2.5"/><path d="M18 22L23 27L31 17" stroke="#f6e4c8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
export function eighthArtwork({shield,building,partners,back=false,height}) {
  const image=(src,x,y,w,h,extra='')=>'<image href="'+src+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" preserveAspectRatio="xMidYMid meet" '+extra+'/>';
  const defs='<defs><linearGradient id="maroon" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#790824"/><stop offset=".5" stop-color="#500012"/><stop offset="1" stop-color="#26000a"/></linearGradient><linearGradient id="champagne" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff0d2"/><stop offset=".42" stop-color="#e5bc7d"/><stop offset=".65" stop-color="#fae6be"/><stop offset="1" stop-color="#b88a50"/></linearGradient><linearGradient id="photo-gold-top" gradientUnits="userSpaceOnUse" x1="265" y1="231" x2="491" y2="496"><stop stop-color="#e5bc7d" stop-opacity="0"/><stop offset=".28" stop-color="#fff0d2"/><stop offset=".75" stop-color="#e5bc7d"/><stop offset="1" stop-color="#b88a50" stop-opacity="0"/></linearGradient><linearGradient id="photo-gold-bottom" gradientUnits="userSpaceOnUse" x1="143" y1="469" x2="373" y2="586"><stop stop-color="#e5bc7d" stop-opacity="0"/><stop offset=".3" stop-color="#e5bc7d"/><stop offset=".75" stop-color="#fff0d2"/><stop offset="1" stop-color="#b88a50" stop-opacity="0"/></linearGradient><mask id="campus-lines">'+image(building,86,806,386,153)+'</mask><filter id="partner-cutout" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 1.8 1.8 1.8 0 -.75"/></filter></defs>';
  let content=defs+'<rect width="638" height="'+height+'" fill="url(#maroon)"/>';
  if(back) {
    content += [
      '<path d="M390 0Q536 25 638 160V225Q576 82 450 32Z" fill="#35000c" opacity=".65"/>',
      '<path d="M367 0Q527 42 638 157" fill="none" stroke="#d7ad67" stroke-width="2"/>',
      '<path d="M437 -10Q552 69 650 190L650 126Q559 42 478 -10Z" fill="url(#champagne)"/>',
      '<path d="M479 0Q593 87 638 163V226Q584 90 479 0Z" fill="#f7e5bf"/>',
      '<path d="M0 724Q35 925 301 1005" fill="none" stroke="#e5bd78" stroke-width="3"/>',
      '<path d="M0 790Q47 930 311 1005H218Q62 965 0 851Z" fill="url(#champagne)"/>',
      '<path d="M0 835Q103 963 373 1005H299Q111 967 0 881Z" fill="#f5ddb0"/>',
      '<path d="M0 815Q60 939 311 1005H288Q65 949 0 841Z" fill="#ae8044" opacity=".45"/>',
      '<g text-anchor="middle" fill="#efd39e"><text x="319" y="163" font-family="Georgia,serif" font-size="68">MLSA</text><text x="319" y="227" font-family="Arial,sans-serif" font-size="32" font-weight="700" letter-spacing="5">SZABIST ISLAMABAD</text></g>',
      '<path d="M195 280H159Q138 280 138 301V333M443 280H479Q500 280 500 301V333M138 561V593Q138 614 159 614H195M500 561V593Q500 614 479 614H443" fill="none" stroke="url(#champagne)" stroke-width="11" stroke-linecap="round"/>',
      '<text x="319" y="670" text-anchor="middle" font-family="Arial,sans-serif" font-size="39" font-weight="700" fill="#f4dfb7">Scan to Verify</text>',
      '<path d="M35 720Q319 716 603 720Q319 723 35 720" fill="#f4dfb7"/>',
      '<path d="M307 799V894" stroke="#9f9585" stroke-width="2"/>',
      szabistBackLogo(86,814,188,70),
      '<svg x="333" y="791" width="230" height="105" viewBox="330 745 230 105">'+image(partners,0,0,638,982,'filter="url(#partner-cutout)"')+'</svg>'
    ].join('');
  } else {
    content+='<path d="M0 0H98L0 95Z" fill="#f5dfba"/><path d="M638 215V325L462 506V395Z" fill="url(#champagne)"/><path d="M638 325V371L474 536V492Z" fill="#c49b67"/><path d="M25 530L170 388V420L25 563Z" fill="url(#champagne)"/><path d="M0 890L101 792V822L0 921Z" fill="url(#champagne)"/><path d="M638 835V1005H399Z" fill="url(#champagne)"/><path d="M638 899V1005H473Z" fill="#f7e2be"/><g stroke="#edcf99" stroke-width="5" stroke-linecap="round"><path d="M0 369L88 273M0 391L88 295M0 413L88 317M0 435L88 339M0 457L88 361"/></g>';
    content+=image(shield,78,63,140,154)+'<path d="M256 78V186" stroke="#fff3e0" stroke-width="5" stroke-linecap="round"/><g font-family="Arial,sans-serif" font-weight="700" fill="#fff4e6"><text x="283" y="98" font-size="29">Microsoft Learn</text><text x="283" y="134" font-size="29">Student Ambassadors</text><rect x="283" y="151" width="306" height="40" rx="5" fill="#edd0a1"/><text x="295" y="180" font-size="27" fill="#510014">SZABIST ISLAMABAD</text></g>';
    content+='<path d="M265 231H424Q491 231 491 298V496" fill="none" stroke="url(#photo-gold-top)" stroke-width="8" stroke-linecap="round"/><path d="M143 469V519Q143 586 210 586H373" fill="none" stroke="url(#photo-gold-bottom)" stroke-width="8" stroke-linecap="round"/><rect x="159" y="249" width="318" height="324" rx="60" fill="#dfe2e8" stroke="#ffffff" stroke-width="8"/><circle cx="318" cy="365" r="55" fill="#a9adb8"/><path d="M215 529Q219 430 318 430Q417 430 421 529Z" fill="#a9adb8"/>';
    content+='<path d="M84 592H585Q596 592 589 605L550 667H45Q35 667 42 655L73 603Q78 592 84 592" fill="#f3ddba"/><rect x="148" y="684" width="342" height="52" rx="26" fill="#680d22" stroke="#e7c28b" stroke-width="3"/><g fill="none" stroke="#efd5aa" stroke-width="3" stroke-linejoin="round"><path d="M96 690H128V711H96Z M91 723L96 715H128L134 723Z"/><g transform="translate(-20 0)"><path fill="#efd5aa" d="M519 692L528 680L540 683L552 680L560 692L558 706L548 716L531 716L521 707Z M526 713L520 735L535 728L540 738L549 715"/><circle cx="540" cy="699" r="10" fill="#680d22"/><path d="M535 699L539 703L546 694"/></g></g><rect x="83" y="803" width="391" height="160" fill="#f1dfc6" mask="url(#campus-lines)"/>';
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1700" viewBox="0 0 638 '+height+'">'+content+'</svg>';
}
