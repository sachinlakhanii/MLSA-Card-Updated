# MLSA Card Studio (PRIVATE)

Internal tool for the core team. Creates member cards and publishes each member to the public website.
Never link to this project from the public website and do not share its address.

```
msa-card-studio/
├── index.html
├── assets/
│   ├── css/    studio.css (interface), card.css (card artwork + social image)
│   ├── js/     main.js, card.js, editor.js, export.js, social.js, publish.js, dots.js, state.js, utils.js
│   └── img/    logos and favicon
├── api/publish.js          Server function: checks the admin key and commits to the website repo
├── lib/                    github.js, validate.js, profile-page.js (used by the server function)
├── package.json  vercel.json  .env.example  .gitignore
```

## How publishing works (no database)
"Publish member" sends the details, photo, card image and social image to `/api/publish`.
The server function checks the admin key, validates everything, then makes ONE commit to the public
website repo containing the profile page, images and the updated `data/members.json`.
Vercel redeploys the public website, and the member appears in its directory.

## Setup
1. Create a GitHub **fine-grained personal access token**: Settings > Developer settings > Personal access tokens.
   Repository access: **only** the public website repo. Permission: **Contents: Read and write**.
2. Push this folder to its own **private** GitHub repo and import it into Vercel as a separate project (Framework Preset **Other**).
3. In Vercel > Project Settings > Environment Variables add the values from `.env.example`
   (ADMIN_KEY, GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH, SITE_URL). Redeploy.
4. Open the studio, fill in a member, enter the admin key, click **Publish member**.

Optional: turn on Vercel's Deployment Protection for this project so only your team can open the page at all.

## Run it locally
1. Install Node.js (LTS) from nodejs.org.
2. Copy `.env.example` to `.env.local` and fill in the values.
3. In this folder run `npm run dev`, then open http://localhost:3000.
The card designer works without any settings. Publishing needs the settings, and it commits to the real GitHub repo.

## Notes
- Publishing needs the deployed studio. It does not work when `index.html` is opened from your computer.
- Requests are limited to about 4.5 MB by Vercel; the studio sends web-sized images to stay under that.
- A profile link name that already exists is rejected. Pick another, for example `ali-khan-2`.

## Managing members

Enter the admin key under **Members on the website**, load the list, then select a member to edit or delete. Editing keeps the profile link, member ID and issued date. New member returns the form to create mode. The theme is stored in the directory; older records default to the dark theme.

The authenticated API exposes `GET /api/members`, `GET /api/member?slug=...`, `POST /api/publish` (mode `create` or `update`), and `POST /api/delete`. All require the `x-admin-key` header. The storage adapter in `lib/storage.js` selects local files or GitHub; `lib/api.js` centralizes configuration and authentication. Local test mode writes to `LOCAL_SITE_DIR`. Run `node scripts/test-members.js` to test handlers against a temporary directory.

## Optional GitHub handle

Enter a GitHub username, `@username`, or a full github.com profile URL. The form normalizes it to a username; the API stores `github` as `https://github.com/username`. Usernames have 1–39 letters/digits with single hyphens between them. Invalid names block publishing, and external URLs are rejected by the form or dropped by the server. Empty/placeholder values and old records without `github` work normally.

The wide card footer displays only the handles provided, with brand icons and a divider only when both exist. Long names shrink to 14px, then use an ellipsis. Member editing restores GitHub; generated profiles show a matching optional GitHub button. Existing published images/pages receive the new footer/buttons when updated and republished.

Font Awesome Free 6.7.2 is self-hosted in `assets/vendor/fontawesome/` (core and brands CSS, brands WOFF2, and upstream `LICENSE.txt`), with the same files installed separately in the public website. No icon CDN is used. The export waits for the brands font. Run `node scripts/test-github.js` for normalization, validation and profile button checks.

Generated profiles use the public site's `profile.css` and `profile.js` for the responsive identity/credential layout, card enlargement dialog, downloads, profile-link copy controls and reduced-motion animations. `lib/profile-page.js` owns this shared template. Update existing generated profile HTML when changing its structure so current and newly published members remain consistent; preserve each page's canonical origin.

## Publishing both card themes

Publishing renders the wide card twice, using the real Dark and White artwork without changing the current editor selection. `files.card` carries the selected theme and optional `files.cardAlternate` carries the opposite theme. The API writes `card.png`, `card-dark.png` and `card-light.png` in the same commit and sets `cardThemes: true`. The public theme switch uses these variants in both the directory and profiles, including downloads.

The client tries scales 1.5, 1 and 0.75 while preserving the card ratio. Each PNG remains at most 2,000,000 bytes, and the full JSON request is limited to 4,400,000 bytes to stay below Vercel's 4.5 MB limit. The server checks the same request limit in `lib/validate.js`. Legacy requests without an alternate card remain supported; they use `card.png` and clear stale variants on update. The social image stays unchanged, and Download PNG still exports the selected layout and theme.

Photo exports use `assets/js/export-photo.js` to bake the photo frame's cover crop and object position at the requested resolution before html2canvas runs. This avoids stretching when a portrait, landscape or previously cropped photo is shown in a different card frame. Only the export clone changes; the uploaded photo, editor and layout selection are preserved. Run `node scripts/test-export-photo.js` to check the crop geometry.

The local server reloads API handlers and their dependencies in a fresh worker for every request, including the profile template. Publishing checks the server protocol before uploading. Restart the server once after upgrading from the old server implementation, then refresh the browser; future API/template edits load automatically. Versioned member image URLs refresh cards and photos after an update.

## Verification card backs

Use Front / Back above the Portrait preview to inspect either side. Wide is front-only. Downloading Portrait always creates one PNG with the back on the left and front on the right, at identical dimensions and the selected theme, separated by a transparent 64px gap at design resolution. At 3x resolution the combined image is 6672 x 5100 with a 192px gap; smaller scales are retried if a device cannot allocate the full canvas. Both sides use the team artwork described below. Backs show the verification artwork and a real locally generated QR code linking to SITE_URL/profile/<slug>. Member names and profile handles are not printed on the back. The code has a white four-module quiet zone in both themes; no third-party QR service receives member data. The MIT-licensed QR encoder is self-hosted under assets/vendor/qrcode.

The public GET /api/site endpoint exposes only SITE_URL. Set SITE_URL to the public website address and restart the local server before printing or distributing cards; localhost links only work on the same computer. Publish the member before sharing its QR code. Updates keep the profile slug, so existing QR links continue to open the current record.

Publishing generates card-back-portrait-dark.svg and card-back-portrait-light.svg plus a portrait default card-back.svg, and removes obsolete wide-back files, using the validated member and server-configured website URL. This adds no image uploads to the 4,400,000-byte request. Public profile previews and downloads remain wide front-only. Card-back SVGs are self-contained print-resolution artwork; Portrait front and back are downloaded together as one PNG from the studio.

Checks: node scripts/test-verification.js, node scripts/test-members.js. Also decode exported PNGs and published SVGs with an independent QR reader for both themes after changes.

## Team card artwork

Wide uses the supplied Social Cards design, rearranged from 1080x1080 to 1080x1012. Portrait uses the supplied Code Cards front/back artwork, scaled proportionally from 638x982 to 1080 pixels wide, with about 38 pixels inserted in a plain gradient area to reach 1700 pixels high. Logos and artwork content are not stretched. The original shield and building are in `assets/img/card-design/`; embedded Portrait originals in `assets/js/card-art-assets.js` keep published SVG backs independent of studio URLs.

`assets/js/card-palettes.js` holds the supplied eight team palettes/icons. `card-artwork.js` matches Team text (including common variants), falls back to MLSA SZABIST, and generates decoration and White artwork. `card-presentation.js` applies artwork and fits live name/team/role text; `assets/css/card-design.css` owns the layouts. Baked Portrait pill labels are covered by the live pill; member names and roles remain live text. The photo editor reads the new frame geometry, and exports still bake the cover crop without changing editor state.

Both designs have real Dark/White versions. White uses pale team backgrounds and dark lettering/line art; original partner logos remain on a dark panel on the Portrait back. The supplied raster artwork retains its original source detail even at higher PNG export resolutions. Montserrat, Inter and Space Grotesk WOFF2 fonts are self-hosted with their SIL OFL licenses under `assets/vendor/`. Card icons are local SVG; Font Awesome and QR licenses remain intact. The separate 1200x630 social image and the public site's layouts are unchanged.

Run `node scripts/test-card-design.js` for palette aliases, proportional frame bounds, escaped artwork and self-contained themed backs. Also run all four existing test scripts and browser checks after artwork changes. Existing members receive the new artwork when loaded and published again; their IDs and profile URLs are preserved.

## Dark-only cards

All eight Wide cards now share the layout in `assets/js/wide-layout.js`: a full white photo frame with a proportional photo, single gradient corner accents, a filled placeholder, an underlined CORE TEAM label, and matched header/footer/ribbon positions. Each team retains its own palette; the eighth keeps its maroon and champagne colors. Pill width and text size accommodate the selected team, and long roles shrink to stay clear of the pill. Portrait artwork is independent of this Wide layout.

White card selection has been removed. Wide and Portrait previews/downloads use Dark artwork, including when loading older White-theme members. Publishing writes the same Dark Wide PNG to both existing website variant URLs, keeping the public theme switch compatible. Portrait verification backs also use Dark artwork for both legacy theme names. Republish existing members to replace their previously saved White images. This supersedes the older two-theme design notes above.
