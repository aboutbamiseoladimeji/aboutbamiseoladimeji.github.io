# Personal About-Me Website

A minimalist, responsive one-page personal website with CV/résumé downloads and a starter admin dashboard. Public hosting is designed for GitHub Pages.

## Important status

- The public one-page website works as a static site.
- Placeholder content is in `data/site.json`.
- The admin screen is a starter interface, not a ready-to-use login until configured.
- Google sign-in and secure publishing require a Supabase project and configuration.
- The included Edge Function publishes only `data/site.json`. File uploads are not implemented yet; add documents to `assets/` and update their paths in the content JSON until upload support is added.
- Never put a GitHub personal access token in browser JavaScript or commit it to this repository.

## 1. Create a new GitHub repository

1. Create a repository named `about-me-site` (or another name you prefer).
2. Upload the contents of this folder so `index.html` is at the repository root.
3. Commit to the `main` branch.
4. Open **Settings → Pages** and select **Deploy from a branch**, branch `main`, folder `/ (root)`.
5. Wait for GitHub Pages to publish. For a normal repository the public URL is usually `https://YOUR-USERNAME.github.io/about-me-site/`. For a repository named exactly `YOUR-USERNAME.github.io`, the URL is `https://YOUR-USERNAME.github.io/`.

## 2. Replace placeholder content

Edit `data/site.json` in GitHub, or locally before uploading. Replace the sample name, title, biography, education, experience, skills, social URLs, and document paths. Keep valid JSON syntax.

Add your PDFs to `assets/` and update the matching `url` fields. Suggested filenames: `resume.pdf`, `cv.pdf`. Do not commit sensitive documents that you do not want public: files in a public GitHub repository can be accessed by anyone.

Replace `assets/profile-placeholder.svg` with a photo file and update `profile.photo` in `data/site.json`.

## 3. Configure Google login and publishing (Supabase)

This is a separate setup step; GitHub Pages alone cannot securely keep a GitHub token secret.

1. Create a Supabase project on its free tier, subject to its current limits.
2. In Supabase Authentication, enable Google as an OAuth provider. Create OAuth credentials in Google Cloud Console and configure the authorized redirect URLs exactly as Supabase instructs.
3. Add the site URL and `/admin/` URL to Supabase Authentication's allowed redirect URLs.
4. Copy your Supabase project URL and anon/publishable key into `admin/admin.js`. The anon key is intended for browser use; never put a service-role key there.
5. Deploy `supabase/functions/publish-site/index.ts` as an Edge Function named `publish-site`.
6. Set server-side Edge Function secrets: `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `ALLOWED_ADMIN_EMAIL`, and optionally `ALLOWED_ORIGIN`.
7. Create a fine-grained GitHub token with access only to this repository and **Contents: Read and write** permission. Store it only as the `GITHUB_TOKEN` secret in Supabase. Never add it to this repository or the browser.
8. In `admin/admin.js`, keep the configured admin email consistent with `ALLOWED_ADMIN_EMAIL`. The Edge Function checks that only that Google account can publish.
9. Test sign-in and publishing using a harmless edit to the content JSON.

Use the official Supabase and GitHub documentation for current dashboard labels and OAuth setup instructions. Do not share secrets in chat.

## 4. Admin dashboard limits in this starter

The admin currently edits the full `data/site.json` as JSON. This is a foundation, not yet a form-based editor for every field. It publishes changes to the `main` branch, triggering a GitHub Pages update. It does not upload images or PDFs yet, and does not offer a visual preview before publishing.

## 5. Security and privacy

- Keep the repository public only if all committed content and documents are intended to be public.
- A Google login button alone is not security. The Edge Function checks the signed-in user's email before allowing a publish.
- Keep GitHub tokens and any Supabase service-role key server-side.
- Review the free plans and usage limits of external services before launch.
