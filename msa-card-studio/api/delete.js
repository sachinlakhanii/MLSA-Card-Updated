import { setup, members, fail } from '../lib/api.js';
import { cleanSlug, HttpError } from '../lib/validate.js';
export default async function handler(req, res) {
  try {
    const { store } = setup(req, res, 'POST'), slug = cleanSlug(req.body && req.body.slug);
    const data = await members(store), index = data.members.findIndex(m => m.slug === slug);
    if (index < 0) throw new HttpError(404, 'Member not found.');
    const record = data.members.splice(index, 1)[0];
    const paths = await store.list(`assets/members/${slug}`);
    const profile = `profile/${slug}/index.html`;
    if (await store.readBinary(profile)) paths.push(profile);
    const changes = paths.map(path => ({ path, content: null }));
    changes.push({ path: 'data/members.json', content: JSON.stringify(data, null, 2) + '\n' });
    await store.commit(changes, `Delete member: ${record.name}`);
    return res.status(200).json({ ok: true });
  } catch (err) { return fail(res, err); }
}
