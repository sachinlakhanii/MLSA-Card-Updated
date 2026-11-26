import { randomBytes, createHash } from 'node:crypto';
import { cleanMember, decodeImage, checkPublishSize, HttpError } from '../lib/validate.js';
import { setup, members, fail } from '../lib/api.js';
import { profileHtml } from '../lib/profile-page.js';
import { PUBLISH_VERSION } from '../assets/js/publish-protocol.js';
import { profileUrl, cardBackSvg } from '../assets/js/verification.js';
const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function newId() { return 'MLSA-' + Array.from(randomBytes(6), b => chars[b % chars.length]).join(''); }
export default async function handler(req, res) {
  try {
    const { cfg, store } = setup(req, res, 'POST');
    const body = req.body || {}, mode = body.mode || 'create';
    checkPublishSize(body);
    if (body.publishVersion && body.publishVersion !== PUBLISH_VERSION) throw new HttpError(426, 'Refresh the studio before publishing.');
    if (mode !== 'create' && mode !== 'update') throw new HttpError(400, 'Invalid mode.');
    const member = cleanMember(body.member), files = body.files || {};
    const data = await members(store), index = data.members.findIndex(m => m.slug === member.slug);
    if (mode === 'create' && index !== -1) throw new HttpError(409, 'A member with this profile link already exists.');
    if (mode === 'update' && index === -1) throw new HttpError(404, 'Member not found.');
    const card = decodeImage(files.card, 'image/png', 2_000_000, 'card');
    const alternate = files.cardAlternate == null ? null : decodeImage(files.cardAlternate, 'image/png', 2_000_000, 'alternate card');
    const social = decodeImage(files.social, 'image/png', 1_000_000, 'social');
    const photo = member.hasPhoto ? decodeImage(files.photo, 'image/jpeg', 800_000, 'photo') : null;
    const old = index < 0 ? null : data.members[index];
    const dir = `assets/members/${member.slug}`;
    const existingAssets = await store.list(dir);
    if (old && !alternate && (old.cardThemes || ['dark', 'light'].every(theme => existingAssets.includes(`${dir}/card-${theme}.png`)))) {
      throw new HttpError(409, 'This member needs both card themes. Refresh the studio and try again.');
    }
    const verificationUrl = profileUrl(cfg.site, member.slug);
    const hash = createHash('sha256').update(verificationUrl);
    for (const image of [card, alternate, social, photo]) if (image) hash.update(image);
    const assetVersion = hash.digest('hex').slice(0, 16);
    const record = { slug: member.slug, name: member.name, team: member.team, role: member.role, linkedin: member.linkedin, github: member.github, theme: member.theme, cardThemes: Boolean(alternate), id: old ? old.id : newId(), issued: old ? old.issued : new Date().toISOString(), photo: Boolean(photo) };
    record.assetVersion = assetVersion;
    record.cardBack = true;
    if (old) { record.updated = new Date().toISOString(); data.members[index] = record; } else data.members.unshift(record);
    const changes = [
      { path: `profile/${record.slug}/index.html`, content: profileHtml(record, cfg.site) },
      { path: `${dir}/card.png`, content: card }, { path: `${dir}/social.png`, content: social },
      { path: 'data/members.json', content: JSON.stringify(data, null, 2) + '\n' }
    ];
    for (const theme of ['dark', 'light']) {
      changes.push({path: `${dir}/card-back-portrait-${theme}.svg`, content:cardBackSvg({name:record.name,team:record.team,url:verificationUrl,layout:'badge',theme})});
      const obsolete = `${dir}/card-back-wide-${theme}.svg`;
      if (existingAssets.includes(obsolete)) changes.push({path:obsolete,content:null});
    }
    changes.push({path:`${dir}/card-back.svg`,content:cardBackSvg({name:record.name,team:record.team,url:verificationUrl,layout:'badge',theme:member.theme})});
    if (alternate) {
      changes.push({ path: `${dir}/card-dark.png`, content: member.theme === 'dark' ? card : alternate });
      changes.push({ path: `${dir}/card-light.png`, content: member.theme === 'light' ? card : alternate });
    }
    if (!alternate) {
      for (const theme of ['dark', 'light']) {
        const path = `${dir}/card-${theme}.png`;
        if (existingAssets.includes(path)) changes.push({ path, content: null });
      }
    }
    if (photo) changes.push({ path: `${dir}/photo.jpg`, content: photo });
    else if (existingAssets.includes(`${dir}/photo.jpg`)) changes.push({ path: `${dir}/photo.jpg`, content: null });
    await store.commit(changes, `${old ? 'Update' : 'Add'} member: ${record.name}`);
    return res.status(200).json({ ok: true, id: record.id, cardThemes: record.cardThemes, publishVersion: PUBLISH_VERSION, url: `${cfg.site}/profile/${record.slug}` });
  } catch (err) { return fail(res, err); }
}
