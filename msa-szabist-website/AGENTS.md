# Project guidance

This is a public static website for MSA SZABIST Islamabad. Use separate plain HTML, CSS and JavaScript files, without a database, framework or build step. Public pages must not mention private administration tools or card creation.

Keep the order of `data/members.json` in the home carousel. Member cards must keep their 1080:1012 proportions. Member records may contain an optional `github` HTTPS github.com profile URL; missing or empty values mean no GitHub button. Preserve backward compatibility with older records.

Self-hosted Font Awesome Free 6.7.2 core/brands CSS and brands WOFF2 live in `assets/vendor/fontawesome/`, with upstream `LICENSE.txt`. Keep the license and CSS comments. Profile pages link these assets and show social buttons only for URLs that exist. Do not load icon fonts from a CDN.

Member profile enhancements belong in `assets/js/profile.js`, with styles scoped to `.profile-page` in `assets/css/profile.css`. Keep static content available without JavaScript, card proportions intact, dialog controls keyboard-accessible, and animations compatible with reduced-motion preferences. Keep generated profile markup consistent with its publishing template.

Use the shared theme preference and asset switching in `assets/js/theme.js` on both home and profile pages. Keep palette/ambient colours in `base.css` and respect explicit `data-theme` values even when they differ from the operating system. Records marked `cardThemes: true` use genuine `card-dark.png`/`card-light.png` assets; older records use `card.png`. Do not simulate themes with image filters, and keep download/full-size links in sync with the preview.

Keep `serve.json` directory listings disabled. Missing routes must receive the actual HTTP 404 status and root `404.html`, not a home-page fallback or a JavaScript redirect. Keep the 404 page theme-aware and recovery search safe with createElement/textContent. Preserve Vercel's static custom-404 convention without adding a catch-all rewrite to the home page.

Branding: use MLSA SZABIST Islamabad and Microsoft Learn Student Ambassador(s), with the supplied assets/img/microsoft_learn_student_ambassador_4k_transparent.png badge, displayed through assets/css/brand.css without cropping or stretching. Preserve existing member IDs and profile links. Card headers group the badge, Microsoft Learn title and campus text without overlapping the SZABIST logo.

Verification card backs use the shared cardBackSvg/profileUrl helpers in the studio assets/js/verification.js. Keep QR codes self-contained, with a white quiet zone in both themes and the configured SITE_URL/profile/<slug> target. Publishing generates Portrait backs in both themes on the server without additional image uploads. Wide cards are front-only. Portrait PNG downloads combine the back on the left and front on the right at identical dimensions. Preserve the MIT license for the vendored QR encoder. Test with node scripts/test-verification.js in the studio and decode actual exported QR images when changing artwork.
