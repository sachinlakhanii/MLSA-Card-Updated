import { PUBLISH_VERSION } from '../assets/js/publish-protocol.js';
import { setup, members, fail } from '../lib/api.js';
export default async function handler(req, res) {
  try { const { store } = setup(req, res, 'GET'); const data = await members(store); return res.status(200).json({ members: data.members, publishVersion: PUBLISH_VERSION }); }
  catch (err) { return fail(res, err); }
}
