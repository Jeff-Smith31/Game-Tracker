# TableTop HQ — Letter Jam Virtual Sheet (PWA)

A minimal, offline-first web app to track board games. First template: Letter Jam virtual sheet. Designed with a classy blue and black theme. Fully functional without internet once installed.

## Features
- Works entirely offline (Progressive Web App)
- Mobile-friendly virtual sheet for Letter Jam
- Add/Remove rows, per-cell letter inputs, game notes
- Local save (stored on your device)
- Import/Export JSON
- “Install” button to add the app to your phone (Android, iOS via Add to Home Screen)

## Quick Start (Local)
1. Open `index.html` directly in a browser to preview UI. For PWA/offline caching and install prompts, serve via a local server:
   - Python 3: `python3 -m http.server 8080`
   - Node: `npx serve .`
2. Navigate to `http://localhost:8080`.
3. Use the Install button or browser menu to add to your device.

## Deploy to AWS (S3 + CloudFront)
You can host this as a static site and install it like an app.

Option A — Automatic deploy on GitHub push (recommended)
This repo includes a GitHub Actions workflow that syncs the site to S3 and optionally invalidates CloudFront on every push to the main or master branch.

Setup steps:
1. Create an S3 bucket (e.g., `tabletop-hq`) in your AWS account. Static website hosting is optional if you use CloudFront; otherwise enable it and note the website endpoint.
2. (Recommended) Create a CloudFront distribution pointing to your S3 website endpoint. Set Default Root Object to `index.html`.
3. Configure GitHub repository Variables/Secrets:
   - Variables (or Secrets):
     - `AWS_REGION` (e.g., `us-east-1`)
     - `S3_BUCKET` (your bucket name)
     - `CLOUDFRONT_DISTRIBUTION_ID` (optional, for cache invalidation)
     - `AWS_ROLE_ARN` (recommended) — IAM role to assume via GitHub OIDC
   - If you can’t use a role, set Secrets instead:
     - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
4. If using the OIDC role (recommended), create an IAM role with these basics:
   - Trust policy for GitHub OIDC (audience sts.amazonaws.com) and your repo. You can use AWS’s "Configure role for GitHub OIDC" wizard or attach a trust policy like:
     - Issuer: `https://token.actions.githubusercontent.com`
     - Condition `token.actions.githubusercontent.com:sub` matches `repo:OWNER/REPO:ref:refs/heads/main` (and/or `master`).
   - Permissions policy allowing:
     - `s3:ListBucket` on your bucket
     - `s3:PutObject`, `s3:DeleteObject`, `s3:PutObjectAcl`, `s3:PutObjectTagging` on `arn:aws:s3:::YOUR_BUCKET/*`
     - If using CloudFront: `cloudfront:CreateInvalidation` on your distribution
5. Push to `main` or `master`. The workflow `.github/workflows/deploy.yml` will:
   - Configure AWS credentials via OIDC role or access keys
   - Sync files to S3 with optimal Cache-Control headers
   - Upload index.html, service-worker.js, and manifest with no-store to ensure fast updates
   - Invalidate CloudFront for those files if a distribution ID is provided

Option B — Manual upload
1. Upload all files in the project directory, preserving structure:
   - index.html, styles.css, app.js, service-worker.js, manifest.webmanifest
   - icons/ (entire folder)
2. Set correct content-types:
   - `.html` → `text/html`
   - `.css` → `text/css`
   - `.js` → `application/javascript`
   - `.webmanifest` → `application/manifest+json`
   - `.svg` → `image/svg+xml`
   - `.png` → `image/png` (if you add PNG icons)
3. Make objects public or use an OAC with CloudFront. If using S3 website hosting endpoint, ensure public read access.
4. (Recommended) Put CloudFront in front of S3:
   - Origin: your S3 website endpoint
   - Default Root Object: `index.html`
   - Caching: Enable caching but allow service worker to control offline.
5. Invalidate CloudFront cache after updates when you change files, especially `service-worker.js`.

Note on paths: The manifest `start_url` and SW asset paths are relative (`./`). If you deploy under a subpath (e.g., `https://example.com/tabletop/`), this will still work because we cache `./` and relative assets. If you deploy to a domain root, no changes needed.

## How to Install on Phone
- Android (Chrome): Open the site, tap the ⋮ menu → Install app or Add to Home screen.
- iOS (Safari): Tap the Share icon → Add to Home Screen.
- Desktop: In Chrome/Edge, click the Install icon in the address bar, or use the ⋮ menu.

## Future Templates
This project is structured so you can add more game sheets later. Consider adding additional HTML sections or routing to switch between templates.

## Branding
- Name: TableTop HQ
- Theme: Blue and Black, clean and classy.

## License
See [LICENSE](LICENSE).
