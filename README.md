# Levicity

React/Vite frontend with Clerk authentication and an organization-scoped production workspace.

## Run locally

```sh
pnpm install
pnpm dev
```

Clerk configuration is provisioned with `clerk init`. Never commit `.env.local` or expose `CLERK_SECRET_KEY` to the browser.

In development, the browser sends same-origin `/v1` requests to Vite, which proxies them to `http://127.0.0.1:8000`. This avoids browser CORS preflights. To change the local backend address, update `server.proxy` in `vite.config.ts`.

Open the app at `http://localhost:5173` so Clerk session tokens match the backend’s authorized-party setting. For production, set `VITE_API_BASE_URL` to the API origin (without `/v1`), or configure a same-origin `/v1` reverse proxy. This is public configuration, not a secret.

Start the backend from the sibling `levicity` repository, allowing the **actual browser origin** printed by Vite. The development server prefers port 5173 and automatically selects the next available port if it is occupied:

```sh
CLERK_AUTHORIZED_PARTIES=http://localhost:5173 \
CORS_ALLOWED_ORIGINS=http://localhost:5173 \
make local-api
```

Use Clerk's development instance. The app activates a sole existing membership
automatically; users with multiple memberships choose a workspace. `chrisfregly`
remains the organization for local invoice fixtures.

Set Clerk's user-created organization limit to the number of workspaces each
user may create. Levicity creates the Clerk organization through its API and
immediately links it to the application database.

## Initial workspace

- `/dashboard`: active project cards and recent invoices.
- `/dashboard/projects`: active projects and project creation.
- `/dashboard/invoices?project=<uuid>`: project-filtered invoices with cursor pagination.
- Add `invoice=<uuid>` to open an invoice review panel, including field corrections, project/category assignment, extraction evidence, and original-document download.

Signed-in visitors are redirected from the landing page to `/dashboard`. Signed-out dashboard requests return to the landing page. The frontend calls `/v1/me` before organization endpoints, sends Clerk session tokens, and discards workspace state on organization switches.

Team administration, project archival/renaming, reporting, and RAG approval controls are future additions. The UI never presents page-level invoice data as organization-wide financial totals.

## Verification

```sh
pnpm build
pnpm lint
```

The initial dashboard was also browser-tested with isolated Clerk/API mocks for redirects, pagination, project creation, changed-field-only invoice updates, mobile navigation, and empty/error states. Live end-to-end verification requires the backend and an invited Clerk account.

## Hosting

Configure SPA fallback so `/dashboard` and nested routes serve `index.html`. Configure the hosted frontend origin in the API's CORS and Clerk authorized-party settings, and supply the appropriate public API origin and Clerk publishable key at build time.
