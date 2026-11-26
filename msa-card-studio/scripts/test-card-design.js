import assert from 'node:assert/strict';
import { teamIndex, portraitGeometry, PORTRAIT_SCALE, PORTRAIT_GAP, portraitArtwork } from '../assets/js/card-artwork.js';
import { cardBackSvg, profileUrl } from '../assets/js/verification.js';

// Existing member records use these spelling variants; loading them must preserve the intended palette.
for (const [name,index] of [['Technical',0],['Technical Team',0],[' TECH ',0],['Outreach',1],['Events & Operation',2],['Events and Operations',2],['Events & Ops Team',2],['Marketing',3],['Social Media Team',4],['Sponsorship',5],['Design and Content',6],['MLSA SZABIST Islamabad',7],['Unlisted custom team',7],['',7]]) assert.equal(teamIndex(name),index,name);
assert.equal(Math.round((982+PORTRAIT_GAP)*PORTRAIT_SCALE),1700);
const url=profileUrl('https://members.example.org','example-person');
for(const team of ['Technical','Outreach','Events & Operations','Marketing','Social Media','Sponsorship','Design & Content','MLSA SZABIST']) {
  assert.equal(cardBackSvg({name:'Example',team,url,theme:'light'}),cardBackSvg({name:'Example',team,url,theme:'dark'}),'Legacy light requests must use the dark verification artwork.');
  const {photo,qr}=portraitGeometry(team);
  assert.ok(photo.every(Number.isFinite));
  assert.ok(photo[0]>0&&photo[0]+photo[2]<1080&&photo[1]+photo[3]<1700);
  assert.ok(qr[0]-230>0&&qr[0]+230<1080&&qr[1]-230>0&&qr[1]+230<1700);
  for(const theme of ['dark','light']) {
    const front=portraitArtwork(team,theme);
    assert.ok(front.includes('width="1080" height="1700"'));
    const back=cardBackSvg({name:'<unsafe>',team,url,theme});
    assert.ok(back.includes('&lt;unsafe&gt;'));
    assert.ok(back.includes('>@example-person</text>'));
    assert.ok(back.includes('fill="#FFFFFF"'));
    // Published backs must render independently of private studio asset URLs.
    assert.ok(!/href="(?:https?:|\/assets\/)/.test(back));
  }
}
console.log('Card palette aliases, proportional dimensions, safe artwork and self-contained themed QR backs passed.');
