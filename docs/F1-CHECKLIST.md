# F1 checklist

Done. Live app: [poe-profit.vercel.app](https://poe-profit.vercel.app/). CI: [Actions run](https://github.com/TaylorOlson77/POE-Profit/actions/runs/36368179561) (Playwright job passed).

Do not commit `.env.local`, `.env.neon-production`, or `.env.neon-ci`.

## Env files

- [x] `.env.local` is still the Neon `local` branch. The host contains `ep-royal-wildflower`. It has no `DATABASE_RESET` line. `npm run dev` and `npm run db:seed` keep using this file.
- [x] `.env.neon-local` is not in the repo. No script loads it.

## GitHub (ci branch only)

- [x] Repo secret `CI_DATABASE_URL` is the pooled URL from `.env.neon-ci` (hostname contains `-pooler`).
- [x] Repo secret `CI_DATABASE_URL_UNPOOLED` is the direct URL from `.env.neon-ci` (same string with `-pooler` removed from the host).
- [x] Those secrets are not the `local` URLs and not the `production` URLs.
- [x] There is no `DATABASE_RESET` secret and no `E2E_DATABASE` variable.

Settings → Secrets and variables → Actions → Repository secrets.

## Production branch (one time)

Run these only after this checklist is in the repo with the new scripts. They load `.env.neon-production`. They do not touch `local` or `ci`.

- [x] `npm run db:migrate:deploy:production` — expect no pending migrations. The child branch already copied the schema.
- [x] `npm run db:reset:production` — deletes the copied local rows and inserts the demo strategy.
- [x] The Neon `production` branch shows one strategy: “Expedition + Temple tablets (demo)”. The `local` branch still has your other rows.

Do not reset `ci` yourself. GitHub Actions does that once per run.

## Vercel

- [x] Project is connected to `TaylorOlson77/POE-Profit`.
- [x] Production environment has `DATABASE_URL` and `DATABASE_URL_UNPOOLED` from `.env.neon-production`.
- [x] Production does not have `DATABASE_RESET`.
- [x] Node.js version is 22.
- [x] Preview has no database URLs.
- [x] `main` is deployed: [poe-profit.vercel.app](https://poe-profit.vercel.app/).

Anyone with that URL can create, edit, and delete rows on the production branch. That does not reach `local` or `ci`. `npm run db:reset:production` puts the demo seed back.
