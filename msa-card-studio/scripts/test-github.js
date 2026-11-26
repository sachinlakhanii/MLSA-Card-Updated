import assert from 'node:assert/strict';
import { cleanGithub, cleanMember } from '../lib/validate.js';
import { githubHandle } from '../assets/js/handles.js';
import { profileHtml } from '../lib/profile-page.js';

for (const input of ['', undefined, '[@github-handle]']) {
  assert.equal(cleanGithub(input), '');
  assert.equal(githubHandle(input), '');
}
for (const input of ['octocat', '@octocat', 'https://github.com/octocat/', 'http://github.com/octocat']) {
  assert.equal(cleanGithub(input), 'https://github.com/octocat');
  assert.equal(githubHandle(input), 'octocat');
}
for (const input of ['two words', '-leading', 'trailing-', 'double--hyphen', 'a'.repeat(40), 'https://github.com/user/repo']) {
  assert.throws(() => cleanGithub(input), { status: 400 });
  assert.throws(() => githubHandle(input));
}
for (const input of ['https://example.com/user', 'https://github.com.evil.com/user', 'javascript:alert(1)']) {
  assert.equal(cleanGithub(input), '');
  assert.throws(() => githubHandle(input));
}
assert.equal(cleanGithub('a'.repeat(39)), 'https://github.com/' + 'a'.repeat(39));
const base = { slug: 'test', name: 'Test <Name>', id: 'MSA-TEST', issued: '2026-11-20', linkedin: '', github: '' };
assert.equal(cleanMember(base).github, '');
for (const li of ['', 'https://linkedin.com/in/test']) {
  for (const gh of ['', 'https://github.com/test']) {
    const html = profileHtml({ ...base, linkedin: li, github: gh }, 'https://example.com');
    assert.equal(html.includes('View LinkedIn'), Boolean(li));
    assert.equal(html.includes('View GitHub'), Boolean(gh));
    assert.ok(html.includes('Test &lt;Name&gt;'));
  }
}
console.log('GitHub parsing, validation, optional fields and profile checks passed.');

const hostile = profileHtml({ ...base, name: '<script>alert("name")</script>', id: '<img src=x onerror=alert(1)>', photo: false }, 'https://example.com');
assert.ok(!hostile.includes('<script>alert('));
assert.ok(!hostile.includes('<img src=x'));
assert.ok(hostile.includes('&lt;script&gt;'));
assert.ok(!hostile.includes('Member ID'));
assert.ok(!hostile.includes('data-copy-id'));
assert.ok(!hostile.includes('onerror=alert(1)'));
assert.ok(hostile.includes('avatar-initials'));
assert.ok(!hostile.includes('class="photo"'));
assert.ok(hostile.includes('/assets/js/profile.js'));
assert.ok(hostile.includes('aria-labelledby="dialogHeading"'));
assert.ok(hostile.includes('https://example.com/profile/test'));
console.log('Profile escaping, photo fallback, dialog and metadata checks passed.');
