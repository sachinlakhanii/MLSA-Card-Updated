import { setup, members, fail } from '../lib/api.js';
import { cleanSlug, HttpError } from '../lib/validate.js';
export default async function handler(req, res) {
  try {
    const { store } = setup(req, res, 'GET');
    const slug = cleanSlug(req.query && req.query.slug);
    const data = await members(store), record = data.members.find(m => m.slug === slug);
    if (!record) throw new HttpError(404, 'Member not found.');
    const photo = await store.readBinary(`assets/members/${slug}/photo.jpg`);
    return res.status(200).json({ ...record, github: record.github || '', theme: record.theme === 'light' ? 'light' : 'dark', photo: photo ? `data:image/jpeg;base64,${photo.toString('base64')}` : null });
  } catch (err) { return fail(res, err); }
}
