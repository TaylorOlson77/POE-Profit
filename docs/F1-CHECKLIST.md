# F1 checklist

Your steps for the Neon branches, GitHub, and Vercel. The app code for the reset script and CI is in the repo. Check a box when that step is done.

Do not commit `.env.local`, `.env.neon-production`, or `.env.neon-ci`.

## Env files

- [ ] `.env.local` is still the Neon `local` branch. The host contains `ep-royal-wildflower`. It has no `DATABASE_RESET` line. `npm run dev` and `npm run db:seed` keep using this file.
- [ ] If `.env.neon-local` still exists, delete `DATABASE_RESET=local`. Set `NEON_BRANCH=local` or delete that line. The app does not read `NEON_BRANCH`. No script loads `.env.neon-local`.

## GitHub (ci branch only)

- [ ] Repo secret `CI_DATABASE_URL` is the pooled URL from `.env.neon-ci` (hostname contains `-pooler`).
- [ ] Repo secret `CI_DATABASE_URL_UNPOOLED` is the direct URL from `.env.neon-ci` (same string with `-pooler` removed from the host).
- [ ] Those secrets are not the `local` URLs and not the `production` URLs.
- [ ] There is no `DATABASE_RESET` secret and no `E2E_DATABASE` variable.

Settings → Secrets and variables → Actions → Repository secrets.

## Production branch (one time)

Run these only after this checklist is in the repo with the new scripts. They load `.env.neon-production`. They do not touch `local` or `ci`.

- [ ] `npm run db:migrate:deploy:production` — expect no pending migrations. The child branch already copied the schema.
- [ ] `npm run db:reset:production` — deletes the copied local rows and inserts the demo strategy.
- [ ] The Neon `production` branch shows one strategy: “Expedition + Temple tablets (demo)”. The `local` branch still has your other rows.

Do not reset `ci` yourself. GitHub Actions does that once per run.

## Vercel

- [ ] Project is connected to `TaylorOlson77/POE-Profit`.
- [ ] Production environment has `DATABASE_URL` and `DATABASE_URL_UNPOOLED` from `.env.neon-production`.
- [ ] Production does not have `DATABASE_RESET`.
- [ ] Node.js version is 22.
- [ ] Preview has no database URLs.
- [ ] `main` is deployed. Paste the URL back in chat.

Anyone with that URL can create, edit, and delete rows on the production branch. That does not reach `local` or `ci`. `npm run db:reset:production` puts the demo seed back.
