# Troubleshooting

Back to the [system overview](README.md). Details for each project are in the [studio guide](msa-card-studio/README.md) and the [website guide](msa-szabist-website/README.md).

Use the table that matches where you see the problem. If a message is not listed, copy the exact text from the page or the terminal; it usually names the cause.

## Setup and local development

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `npm.ps1 cannot be loaded because running scripts is disabled on this system` | Windows PowerShell blocks `npm` because it runs as a script file. | Run the studio with `node scripts/dev-server.js`, or use `npm.cmd run dev`, or use Command Prompt. For the website use `npx.cmd serve -l 8000`. You do not need to change the system execution policy. |
| `npm error ENOENT ... package.json` | The command was run in the wrong folder. Only `msa-card-studio/` has a `package.json`; the website folder has none. | Run `npm run dev` or `node scripts/dev-server.js` inside `msa-card-studio/`. Start the website with `npx serve -l 8000` inside `msa-szabist-website/`. |
| `The server is not configured yet.` | A required setting is missing or the settings file is not being read. | Local mode needs `ADMIN_KEY`, `SITE_URL` and `LOCAL_SITE_DIR`. Production needs `ADMIN_KEY`, `GITHUB_TOKEN`, `GITHUB_REPO` and `SITE_URL` (`GITHUB_BRANCH` defaults to `main`). Check the file is named exactly `.env.local` (not `.env.local.txt`), sits next to `package.json` in `msa-card-studio/`, has no quotes or spaces around `=`, and restart the server after editing it. |
| Settings are filled in but the server still says it is not configured | Settings are read only when the server starts. | Press `Ctrl+C` in the terminal and start it again. |
| `EADDRINUSE` or "address already in use" | Another program, or an old copy of the server, is using the port. | Close the old terminal, or set a different `PORT` in `.env.local`. |
| Publishing says it is only available on the deployed studio, or the API returns 404 or 405 | The studio page was opened as a file (`file://`), or from a server that does not run the API. | Open the studio through `http://localhost:3000` after starting `node scripts/dev-server.js`, or through the deployed studio address. |
| The website shows the home page instead of "not found" for a missing profile | The website server was started with `serve -s`, which sends every unknown address to the home page. | Start it with `npx serve -l 8000` (no `-s`). |
| `/profile/<slug>` shows "not found" locally | The member was not published, or was published to a different folder. | Check `LOCAL_SITE_DIR` points to the website folder you are serving, then look for `profile/<slug>/index.html` and the member's entry in `data/members.json`. |

## Publishing and the admin key

| Symptom | HTTP status | Cause | Fix |
| --- | --- | --- | --- |
| `Wrong admin key.` | 401 | The key typed in the studio differs from `ADMIN_KEY` on the server. | Re-enter it exactly (no spaces). After changing `ADMIN_KEY`, restart the dev server or redeploy the studio. |
| `A member with this profile link already exists.` | 409 | Creating a member whose profile link name is already used. | Choose another link name, for example `ali-khan-2`, or edit the existing member instead. |
| `The upload is too large.` | 413 | The publish request exceeded the size limit (Vercel limits request bodies to roughly 4.5 MB). | Use a smaller photo. The studio already retries at lower image scales. |
| Invalid name, link name, handle or image | 400 | Input failed server validation (reserved or malformed link name, invalid GitHub handle, wrong image type). | Read the message, correct the field and publish again. |
| Member not found when editing or deleting | 404 | The profile link name does not exist in `data/members.json`. | Reload the member list and choose the member again. |
| `Publishing failed. Check the server settings and try again.` | 500 | An unexpected server error, often a storage or GitHub problem. | Check the server log (terminal locally, Vercel function logs in production) for the real error. |
| The studio says the server is out of date | n/a | The browser and the server disagree on the publish protocol version (`publishVersion`). | Restart the dev server, or redeploy the studio, so both use the same code. Then hard-refresh the studio page (`Ctrl+F5`). |

## GitHub and deployment

| Symptom | Cause | Fix |
| --- | --- | --- |
| GitHub 401 | The token is wrong, revoked or expired. | Create a new fine-grained token and update `GITHUB_TOKEN`; redeploy the studio. |
| GitHub 403 | The token lacks **Contents: Read and write**, the repository is blocked by organization approval, branch protection forbids direct commits, or a rate limit was hit. | Fix the token permission, get organization approval, allow the commit, or wait and retry. |
| GitHub 404 | `GITHUB_REPO` is misspelled, the branch in `GITHUB_BRANCH` does not exist, or the token cannot see that repository (GitHub reports "no access" as 404). | Use the exact `owner/name`, make sure the branch exists and the repository already has an initial commit, and confirm the token was granted that repository. |
| GitHub 422 or a conflict while committing | The branch changed while the publish was running, for example another person published at the same moment. | Publish again. |
| Published successfully but the member is not on the live site | Deployment delay, or the commit went to a branch that is not the website's production branch. | Open the website's Vercel project and check the latest deployment. Make sure the production branch matches `GITHUB_BRANCH`. A commit on another branch creates only a preview. |
| The member list is old after publishing | The browser or a CDN cached the data. | Hard-refresh. The carousel fetches `/data/members.json` without the browser cache, so a persistent old list usually means the deployment has not finished. |

## Test members, exports and sharing

| Symptom | Cause | Fix |
| --- | --- | --- |
| Duplicate or leftover test members | Test publishes are real files in the website folder or repository. | Use **Load members** then **Delete** in the studio. To remove by hand, delete the member's entry from `data/members.json` and the folders `profile/<slug>` and `assets/members/<slug>`, then commit. Old commits in Git still contain the files. |
| Blank icons, square boxes or wrong fonts in a downloaded PNG | The export ran before the fonts finished loading, or a font file failed to load. | Reload the studio, wait a few seconds, and download again. Check the browser console for blocked font or script requests. |
| A Portrait download fails or comes out blank on a phone | The merged Portrait image is very large (about 6672 x 5100 px), and phone browsers limit canvas size and memory. | Download from a desktop browser. |
| The QR code opens `localhost` or the wrong address | `SITE_URL` is set to a local or incorrect address. | Set `SITE_URL` to the real public website address and publish or download again. |
| Link preview (WhatsApp, LinkedIn) does not show | Social platforms cannot reach `localhost`, the Open Graph image address is not public, or the platform cached an old result. | Test on the deployed website. Check `SITE_URL` matches the public address, and use the platform's link-preview refresh tool if it cached an old version. |
| The photo crops differently on the card than in the editor | The editor frame depends on the layout that was selected when you cropped. | Re-open **Edit photo** with the layout you intend to use and apply the crop again. |

## Confirmed code issues

These come from the code review recorded in the overview. Re-check them against the current source before relying on them.

- **Unused legacy file in the website:** `assets/js/directory.js` is the old team and avatar grid. The home page now uses `carousel.js`, so it can be removed.
- **Unused legacy file in the studio:** `lib/local.js` is not used by the active request handlers. Storage goes through `lib/storage.js`.
- **No local-mode example in `.env.example`:** it lists the production settings only. Add the local settings (`ADMIN_KEY`, `SITE_URL`, `LOCAL_SITE_DIR`, `PORT`) as commented lines so new users can copy them.
- **Development server is for local use only:** it is not the production entry point. Do not expose it on a shared network or the internet, and check which network address it listens on before using it on public Wi-Fi.

## Limitations for maintainers

- **No database:** member files live in the website repository. Deleting a member removes current files, but their name, photo and images remain in Git history.
- **No locking:** two people publishing at nearly the same time can collide. One publish may fail and need repeating.
- **Delayed updates:** the success message confirms the file write or commit, not that the website has deployed.
- **Broad publishing token:** the GitHub token can change any file in the website repository. Restrict it to that one repository and rotate it.
- **The editor page is not password protected:** the admin key protects the member APIs, not the page itself. Use deployment access protection to restrict the page, and keep its address private.
- **QR codes do not expire:** a QR is just a link to a public profile. It has no signature or expiry. Removing a member makes the link show "not found".
- **Carousel order is file order:** new members are placed first, and edits keep their position. It does not sort by date.
- **Description/bio field is not implemented.**
- **Not tested:** real GitHub and Vercel deployments, and scanning a printed QR with a phone camera, were not covered by the automated checks. The included scripts do not render real PNGs.
- **Large exports on phones:** very large canvases can fail on mobile browsers.