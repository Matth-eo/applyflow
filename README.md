#Applyflow

A full-stack job application tracker built with Next.js 15, React 19, TypeScript, PostgreSQL, and Auth.js. Each account has a private workspace with application tracking and live dashboard statistics.

## Features

- Admin workspace at `/admin`, with server-enforced roles, searchable users, user details, all-application browsing, and status/daily activity charts.

- Email/password registration and sign-in, bcrypt password hashing, JWT sessions, and database-backed authentication throttling.
- User-scoped create, edit, and delete actions; private pages check the session and current database user.
- Company, position, location, job URL, optional salary, date applied, six workflow statuses, and notes.
- Search across company, position, and location; status filters; newest/oldest creation order; ten-row server-side pagination.
- Dashboard with total applications, all six status counts, five recent applications, a Recharts donut chart, and quick statistics.
- Responsive navigation, light/system/dark themes, accessible Radix dialogs, validation feedback, loading skeletons, empty/error states, and Sonner toasts.
- A checked-in PostgreSQL migration, focused unit tests, a live server/database integration suite, and a GitHub Actions CI workflow.

## Stack

| Layer           | Technology                                                                    |
| --------------- | ----------------------------------------------------------------------------- |
| Framework       | Next.js 15 App Router, React 19, TypeScript                                   |
| Styling         | Tailwind CSS, shadcn/ui-style source components with Radix primitives, Lucide |
| Forms           | React Hook Form and Zod                                                       |
| Tables / charts | TanStack Table and Recharts                                                   |
| Persistence     | Prisma 6 and PostgreSQL, compatible with Neon                                 |
| Authentication  | Auth.js / NextAuth 5, Credentials provider, JWT sessions                      |
| Testing         | Vitest                                                                        |
| Hosting         | Vercel Node.js runtime                                                        |

Auth.js 5 is pinned to `5.0.0-beta.32`; this is an upstream prerelease, used for its App Router API. Next.js is pinned to the patched 15.5.25 release. The lockfile fixes the full dependency tree. Targeted overrides update Next's nested PostCSS and Prisma config's deepmerge-ts; retain them until upstream versions include those security fixes, and validate any dependency changes.

## Run locally

Use **Node.js 24 LTS** and npm. `.nvmrc` selects Node 24 when your version manager supports it. Node 22.13+ is also supported; avoid the non-LTS Node 23 runtime.

1. Install the exact locked dependencies:

   ```sh
   npm ci
   ```

2. Create a Neon project and database. Get both connection strings from Neon's Connect dialog:

   - `DATABASE_URL`: pooled connection; the hostname normally includes `-pooler`.
   - `DIRECT_URL`: direct connection, used by Prisma migrations.
   - Keep `sslmode=require` in both URLs. URL-encode special characters in credentials.

3. Copy `.env.example` to `.env`:

   ```powershell
   # Windows PowerShell
   Copy-Item .env.example .env
   ```

   ```sh
   # macOS / Linux
   cp .env.example .env
   ```

4. Fill in the connection strings and generate a secret:

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

   Copy the generated value into `AUTH_SECRET`. Set `AUTH_URL=http://localhost:3000` locally. Never commit `.env` or reuse an example secret.

5. Apply the included migration and start the app:

   ```sh
   npm run db:deploy
   npm run dev
   ```

6. Open **http://localhost:3000**, create an account, and sign in. A new account starts empty; add an application to populate the dashboard. Ordinary registrations always create `USER` accounts.

## Admin workspace

Apply the role migration, then run the explicit seed command.

macOS/Linux:

```sh
npm run db:deploy
ADMIN_SEED_PASSWORD="<your-private-admin-password>" npm run db:seed
```

PowerShell:

```powershell
npm run db:deploy
$env:ADMIN_SEED_PASSWORD = "<your-private-admin-password>"
npm run db:seed
```

Sign in using the existing login page with `admin@gmail.com` and the private password supplied through `ADMIN_SEED_PASSWORD`, then open `/admin` or use the Admin sidebar link. The seed stores a cost-12 bcrypt hash, never the plaintext credential. Running the seed again preserves an existing administrator's password and profile. It refuses to promote an existing ordinary account that already owns the seed email; resolve that collision explicitly in a trusted database administration session.

For a publicly deployed environment, set `ADMIN_SEED_PASSWORD` to a strong private password before first seeding. The variable is required and affects creation only; rerunning the seed never resets an existing account's credentials. Seeding is not part of application startup or the Vercel build.

The admin area is read-only: `/admin` shows totals and charts; `/admin/users` searches names/emails; `/admin/users/[id]` shows account details and paginated applications; `/admin/applications` searches all applications with status filters and newest/oldest sorting. Normal users are redirected to `/dashboard`, and anonymous visitors to `/login`.

`requireAdmin()` in `src/lib/session.ts` checks the current role in PostgreSQL. Every function in `src/lib/admin.ts` calls it before accessing platform data, independently of the nested admin layout. Any future admin server action must also call this guard before reading or writing. JWT role claims and sidebar visibility are not authorization boundaries. Role revocation takes effect on the next request with the same session. Existing personal CRUD remains owner-scoped. `requirePersonalUser()` redirects admins from `/dashboard` and `/applications` to `/admin` on the server. The sidebar shows only the three admin destinations for admins, and Overview/Applications for users.

“Applications submitted today” counts non-saved applications whose `appliedDate` is today in UTC. “Total interviews” counts current `INTERVIEW` statuses. The daily chart counts creation timestamps over the last 30 UTC calendar days and fills missing days with zero. These are current-state statistics, not status-transition history.

## Environment variables

| Variable       | Purpose                                                                      |
| -------------- | ---------------------------------------------------------------------------- |
| `DATABASE_URL` | Pooled Neon PostgreSQL connection for app queries                            |
| `DIRECT_URL`   | Direct Neon PostgreSQL connection for migrations                             |
| `AUTH_SECRET`  | Random secret for Auth.js token encryption and rate-limit identifier hashing |
| `AUTH_URL`     | Canonical origin: localhost in development, your HTTPS domain in production  |

Both database URLs should point to the same database/branch. Prisma loads `.env` automatically. Generate uses the schema without contacting PostgreSQL; migration and account operations require working database credentials.

## Prisma workflow

```sh
# Apply already-reviewed migrations (first local setup, CI, production)
npm run db:deploy

# After editing schema.prisma, create and apply a DEVELOPMENT migration
npm run db:migrate -- --name describe_your_change

# Regenerate the typed client
npm run db:generate

# Inspect local/development records
npm run db:studio

# Check both connections without displaying credentials
npm run db:check
```

Commit `prisma/migrations` with every schema change. Do not run `migrate dev`, `db push`, or reset against a production database. The initial migration creates the enum, three tables, ownership foreign key with cascade deletion, and query indexes. CUID identifiers and `updatedAt` are supplied by Prisma.

## Deploy to Vercel + Neon

1. Push this project, including `package-lock.json` and migrations, to your Git repository.
2. Import it into Vercel with the **Next.js** preset and **Node.js 24.x**.
3. Add `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, and `AUTH_URL` to the appropriate Vercel environment. `AUTH_URL` must match the HTTPS deployment domain used for sign-in. Auth.js recognizes Vercel's trusted host environment automatically.
4. Use `npm ci` as the install command and `npm run build` as the build command. Keep the default Next.js output settings.
5. Apply production migrations from a controlled release environment using the production database variables:

   ```sh
   npm run db:deploy
   ```

6. Deploy and verify registration, sign-in, CRUD, and sign-out. Confirm that a second account cannot see or modify the first account's applications.

Migrations are deliberately separate from `build`, so a preview build cannot accidentally migrate production. Use a separate Neon branch and environment-scoped secrets for previews. Deploying requires your own Neon and Vercel accounts; this repository does not provision those resources.

## Architecture and learning guide

```text
src/
  app/
    (auth)/              Login and registration pages
    (private)/           Protected workspace layout, dashboard, applications
    api/auth/            Auth.js protocol handlers
  actions/               Server-only authentication and CRUD entry points
  components/
    ui/                  Owned shadcn-compatible primitives
    applications/        Forms, filters, table, deletion confirmation
    dashboard/           Status chart and recent applications
  hooks/                 Shared client hooks
  lib/                   Database access, session guard, queries, Zod schemas
  types/                 Shared status and client DTO types
  utils/                 Display-only date/status helpers
  auth.ts                Auth.js configuration and credentials verification
prisma/                  Relational schema and versioned SQL migrations
tests/                   Validation, ownership, query, and rate-limit tests
scripts/                 Database diagnostics and live integration checks
.github/workflows/       CI with an isolated PostgreSQL service
```

### Server components and private data

Pages fetch data on the server; only interactive forms, charts, navigation, and tables become client components. `requireUser()` verifies both the signed session and that the account still exists. Every data-access function and mutation calls it independently, so a layout guard is not the sole authorization boundary. Authentication redirects to `/login` before any application query can run.

The schema relates `User` to `Application` through `userId`. Reads always filter by the authenticated owner. Updates and deletes combine `id` and `userId` in one database operation, preventing a guessed record ID from granting access. The client cannot choose the owner. Database helpers import `server-only` to prevent accidental bundling into the browser.

### Validation and mutations

React Hook Form uses the same Zod schema as server actions. The browser provides immediate field errors; the server treats every argument as untrusted and validates again. Job URLs accept only HTTP(S). Password registration enforces a 12-character minimum and bcrypt's 72-byte ceiling. Database exceptions become safe user-facing errors. Successful mutations revalidate both private pages and show a toast.

### Queries, tables, and dates

Prisma performs filtering, sorting, and pagination; TanStack Table renders the resulting page. URL query parameters preserve filters and page state. Count and rows share a repeatable-read transaction, and an out-of-range page clamps to the last available page. Search is case-insensitive. Indexes optimize owner/status/date queries; for very large accounts, consider PostgreSQL trigram indexes for substring search.

`appliedDate` is a PostgreSQL `DATE`, serialized as `YYYY-MM-DD` and displayed in UTC so browser timezone differences cannot shift the calendar day. For saved jobs, the form explains that this is the date the opportunity was found. Newest/oldest sorts by record creation time, with an ID tie-breaker.

Dashboard totals cover the whole account. “Added this week” means today and the previous six UTC calendar days. “Moving forward” is the current number at interview, technical exam, or offer divided by non-saved records. It is a current-state ratio, not a historical response or conversion rate; this schema intentionally does not claim to track status history.

### UI organization

Theme tokens live in `globals.css`. The owned Button and Dialog components use shadcn conventions, CVA, and Radix; `components.json` allows the shadcn CLI to add more primitives. Radix supplies focus management, keyboard dismissal, and modal semantics. Reduced-motion preferences are respected. Notes render through React, never as raw HTML.

### Authentication and operations

Auth.js manages encrypted JWT sessions and CSRF-protected authentication endpoints. Password hashes use bcrypt cost 12; hashes never reach the client. An atomic PostgreSQL UPSERT limits sign-in to 10 attempts per email per 15 minutes and registration to 5 attempts per platform-provided IP per hour. Limits are shared by serverless instances and fail closed on database failure. On non-Vercel deployments registration uses a shared local bucket; adapt the trusted-proxy IP handling before hosting behind another platform. Vercel firewall limits can provide an additional edge-level limit.

Expired rate-limit rows are reused on the next matching attempt. For database housekeeping, periodically run this SQL from a trusted scheduled database job:

```sql
DELETE FROM "RateLimit" WHERE "expiresAt" < NOW() - INTERVAL '1 day';
```

Keep `AUTH_SECRET` stable across deploys; rotating it invalidates existing sessions. Production uses HTTPS-only cookies automatically through Auth.js and adds security headers in `next.config.ts`. Email verification, password recovery, and MFA are not included; add a verified email provider and recovery flow before offering account recovery to public users. No email ownership or recovery capability is implied by the registration flow.

## Verification

```sh
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
npm audit
```

Tests cover URL/date/password validation, owner injection attempts, inaccessible updates/deletes, unauthenticated queries/actions, pagination clamping, dashboard ownership, DTO serialization, and rate-limit boundaries. Database calls in unit tests are mocked; these tests do not replace a live PostgreSQL integration check.

For the live integration suite, first build the app, apply its migrations, and run `npm run start` in another terminal. Then run:

```sh
npm run test:integration
```

This suite calls the actual compiled Next.js server actions over HTTP and verifies results in PostgreSQL. It covers registration, hashing, login/session cookies, every workflow status, CRUD, cross-user access attempts, unauthenticated mutations, search, pagination, sort, dashboard rendering, and logout. It only targets a localhost server. Two randomly named test accounts and their applications are removed in a `finally` block. Registration consumes one attempt in the normal rate-limit bucket; avoid repeated runs against a shared production database. If a test process is forcibly terminated, inspect and remove its `applyflow-*-<UUID>@example.invalid` accounts in the development database.

`.github/workflows/ci.yml` runs formatting, lint, type checks, unit tests, migration, production build, and integration tests against a disposable PostgreSQL service. Its database password and Auth.js secret are CI-only constants; no Neon credentials are committed or needed in CI.

The suite includes admin guard, safe seed, role-injection, and admin query tests in addition to the original user-workspace tests. The live suite also verifies admin routes, role-specific navigation, cross-account inspection, personal-page redirects for admins, and immediate role revocation using the same session.

### Browser and responsive checks

The redesigned dashboard uses a highlighted total with a compact Application Pipeline, an empty state instead of an empty donut, Progress Insights, and a desktop table/mobile list for recent applications. Shared typography uses one system sans-serif stack; no font download is required. Navy/green branding, status colors, and all existing data calculations are preserved.

With the production server running locally, install the test browser and run:

```sh
npm exec playwright -- install chromium
npm run test:browser
```

On Windows with Edge already installed, use `$env:PLAYWRIGHT_CHANNEL='msedge'` in PowerShell before running `npm run test:browser` to use its headless engine. Browser tests create disposable user/admin accounts, verify empty and populated states, validation and CRUD, responsive layouts at 320/390/768/1024/1440px, dark mode, mobile navigation, and role redirects. They clean up their own database fixtures. Screenshots and failure traces go to the gitignored `test-results/browser` directory. Vercel deployment remains a separate check.

After connecting a development database, verify:

1. Register two different accounts; sign in separately.
2. Create a job in account A, check every field, then edit its status and notes.
3. Search/filter/sort it; add more than ten jobs and page through them.
4. Confirm dashboard counts update after edits and deletion.
5. Confirm account B has an empty workspace and cannot mutate account A's IDs.
6. Sign out; visit `/dashboard` and `/applications` directly and confirm redirection.
7. Check mobile navigation, keyboard dialogs, dark mode, and a network failure.

## Troubleshooting

- **Prisma P1001 / connection error:** check Neon branch status, both connection strings, TLS, and network access.
- **Runtime connects but migrations fail:** use `npm run db:check`. Confirm the direct URL retains the full region/provider hostname from Neon; it differs from the corresponding pooled hostname only by the `-pooler` suffix. See [Neon's connection pooling documentation](https://neon.com/docs/connect/connection-pooling).
- **Missing tables:** apply `npm run db:deploy` to the same database used by the app.
- **Sign-in unavailable:** verify `AUTH_SECRET`, `AUTH_URL`, migration state, and rate-limit cooldown. Public error messages deliberately avoid disclosing whether an email exists.
- **Registration throttled locally:** the shared local bucket resets after an hour. Use development-only database cleanup when testing; never disable production throttling.
- **Unsupported engine warning:** switch to Node 24 LTS, then reinstall with `npm ci`.
