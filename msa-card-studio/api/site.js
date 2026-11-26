/* Public configuration contains only the already-public verification website URL. */
import { profileUrl } from '../assets/js/verification.js';
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({error:'Method not allowed.'}); }
  try {
    const siteUrl = (process.env.SITE_URL || '').replace(/\/+$/, '');
    profileUrl(siteUrl, 'check');
    return res.status(200).json({siteUrl});
  } catch { return res.status(503).json({error:'Set a valid SITE_URL before generating a verification QR code.'}); }
}
