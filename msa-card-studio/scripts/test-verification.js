import assert from 'node:assert/strict';
import { profileUrl, qrMatrix, cardBackSvg } from '../assets/js/verification.js';
import site from '../api/site.js';
const url = profileUrl('https://members.example.org/', 'test-person');
assert.equal(url, 'https://members.example.org/profile/test-person');
assert.equal(profileUrl('http://localhost:8000', 'test-person'), 'http://localhost:8000/profile/test-person');
for (const base of ['javascript:alert(1)', 'file:///tmp', 'https://user:pass@example.com', 'https://example.com?x=1']) assert.throws(() => profileUrl(base,'test-person'));
for (const slug of ['', '../other', 'a/b', 'invalid user']) assert.throws(() => profileUrl('https://example.com',slug));
const matrix = qrMatrix(url);
assert.ok(matrix.length >= 21 && matrix.every(row => row.length === matrix.length));
assert.throws(() => cardBackSvg({name:'Test',url,layout:'wide'}));
for (const layout of ['badge']) for (const theme of ['dark','light']) {
  const svg = cardBackSvg({name:'<script>alert("test")</script>',url,layout,theme});
  assert.ok(svg.includes(layout === 'wide' ? 'height="1012"' : 'height="1700"'));
  assert.ok(!svg.includes('<script>')); assert.ok(svg.includes('&lt;script&gt;'));
  assert.doesNotMatch(svg, /<text\b[^>]*>[^<]*@/); // Profile handles are no longer printed on the back.
  assert.ok(svg.includes('fill="#FFFFFF"')); // QR panel is white in both themes.
}
const previous = process.env.SITE_URL; process.env.SITE_URL = 'https://members.example.org';
const res = {setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;return this;}};
site({method:'GET'},res);assert.equal(res.code,200);assert.deepEqual(res.body,{siteUrl:'https://members.example.org'});
process.env.SITE_URL='not a URL';site({method:'GET'},res);assert.equal(res.code,503);
if(previous===undefined)delete process.env.SITE_URL;else process.env.SITE_URL=previous;
console.log('Verification URL validation, QR construction, escaped artwork, dimensions and public settings checks passed.');
