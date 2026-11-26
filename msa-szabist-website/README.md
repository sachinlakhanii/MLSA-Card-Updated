# MLSA SZABIST Islamabad - Public Website

Static website. No database, no build step, no admin pages.

```
msa-szabist-website/
├── index.html              Home page: member coverflow in directory order
├── 404.html                Shown when a profile link does not exist
├── robots.txt
├── vercel.json             Clean URLs and basic headers
├── assets/
│   ├── css/                base.css (shared), home.css, carousel.css, profile.css
│   ├── js/carousel.js     Builds the carousel from data/members.json
│   ├── img/favicon.svg
│   └── members/<name>/     card.png, social.png, photo.jpg (added automatically)
├── data/members.json       List of members (updated automatically)
└── profile/<name>/         One profile page per member (added automatically)
```

Member pages, images and directory records are generated when a member is published. Do not edit those by hand, except to remove a member (see below).

## Run it locally
In this folder run `npx serve -l 8000` and open http://localhost:8000. The server reads `serve.json`, which disables directory listings and enables clean profile URLs. Restart the server after changing this configuration. Do not use `serve -s` / `--single`, because its home-page fallback hides real 404 responses.

## Missing pages and profiles

Unknown paths and deleted profile folders without an index return HTTP **404** with `404.html`, retaining the requested URL. The error page uses the shared dark/light theme, offers a directory link and an optional member search, and treats the requested path as text. It works without JavaScript through the directory link. The styling and recovery behaviour live in `assets/css/not-found.css` and `assets/js/not-found.js`.

Vercel automatically uses the root `404.html` for unmatched static routes; no home-page catch-all rewrite is needed. See [Vercel's custom 404 documentation](https://vercel.com/docs/routing/custom-404-pages). For local parity, use the configured `npx serve` command above rather than Python's default error page. Remove the profile HTML as well as its directory record when deleting a member, as an existing HTML file remains a valid static route.

## Deploy (Vercel)
1. Push this folder to a **private** GitHub repo.
2. Vercel: Add New > Project > import the repo. Framework Preset **Other**. No build command. Deploy.

## Remove or correct a member
Delete the member's entry from `data/members.json`, plus the folders `profile/<name>` and
`assets/members/<name>`, then commit. The profile link then shows the "not found" page.

## Optional social links

Member records support an optional `github` field containing an HTTPS github.com profile URL. Empty or missing values are supported. Profile pages show a GitHub button only when provided, alongside LinkedIn when both links exist. The social buttons wrap on small screens.

Font Awesome Free 6.7.2 is self-hosted under `assets/vendor/fontawesome/`: core/brands CSS, `webfonts/fa-brands-400.woff2`, and the upstream `LICENSE.txt`. Preserve the license and CSS comments. Profile pages load the local assets; there is no icon CDN dependency.

## Member profiles

Profiles use `assets/css/profile.css` and the progressive enhancements in `assets/js/profile.js`. The responsive layout combines member identity, social links, a membership record and an undistorted card preview. The card opens in an accessible dialog, with a direct image link as the no-JavaScript fallback. Downloads, copying the profile link, initials for missing photos, subtle reveal animations and reduced-motion support are included. All membership content remains in the static HTML.

## Dark and light themes

The header theme button works on the home page and every profile. `assets/js/theme.js` applies the saved preference before CSS loads, defaults to the system preference, and keeps the selection when navigating. Colours, ambient background, logos, previews, enlarged cards and download links follow the selected theme.

Members with `cardThemes: true` have genuine `card-dark.png` and `card-light.png` wide images in their asset folder. `card.png` remains the default fallback for older records and direct links. The theme switch never recolours a photograph or filters a card image. Both themes share the colour tokens in `assets/css/base.css`.

## Carousel appearance

The controls in `assets/css/carousel.css` are scoped to `#directory`:

- `--card-height`: viewport-height sizing (72vh, 240px minimum, 700px maximum), capped to leave room for the heading/details and to fit narrow stages. The phone rule derives height from `--card-width` instead.
- `--stage-margin`: 32px at each desktop edge, 16px on phones.
- `--stage-padding`: vertical room for shadows.
- `--card-gap`: constant space between visible card edges (24px desktop, 12px phone). Positioning accounts for each card's current scale so gaps do not widen during scrolling.
- `--side-card-scale`: side-card size relative to the centred card (0.82). Cards smoothly grow toward the centre and shrink as they move away.
- `--edge-fade`: stage edge fade (6% desktop, 3% phone).

Up to seven members use accessible pagination dots; larger directories use a compact keyboard-accessible range bar.

Browse with horizontal trackpad scrolling, a mouse wheel over the cards, dragging, touch swiping or the Left/Right keys while focused. Cards form a continuous ring: the last member leads into the first in either direction. The centred card is largest; side cards smoothly grow as they approach it and shrink as they leave. Cards retain their proportions and a fixed edge-to-edge gap, with no overlap, layer swap or forced snapping. Movement uses one animation loop for scrolling, dragging, pagination and keyboard input. Reduced-motion preferences disable the easing. Outer previews fade; the central cards stay clear. The nearest member supplies the details. Click a partially centred card once to centre it, then again to open its profile. Directories with two or three members reuse off-screen image copies for seamless cycling; member records, counter and pagination are not duplicated. A single member stays static. Previous and Next buttons also move smoothly through the same loop; they are hidden for a single member.
