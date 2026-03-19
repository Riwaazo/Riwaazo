# Riwaazo
<<<<<<< HEAD

Next.js 14 (App Router) app for the Riwaazo marketplace/admin. Stack: TypeScript, Tailwind, Prisma, Supabase Auth/Postgres.

## Quick start

```bash
npm install
npx prisma migrate dev
npm run dev
```

App runs at http://localhost:3000.

## Env

Copy `.env.example` to `.env` (if present) and set:

- `DATABASE_URL` (Postgres/Supabase)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (only for server actions/edge if required)

## Scripts

- `npm run dev` — start dev server
- `npm run lint` — lint
- `npx prisma migrate dev` — apply migrations locally

## Features (current)

- Admin panel: vendor/venue approvals with status + notifications; booking status updates with notifications
- Auth via Supabase (roles: admin/vendor/venue/event-planner/user)
- Marketplace pages for vendors/venues; dashboards per role
- Prisma schema synced to migrations in `prisma/migrations`

## Deployment

Build as a standard Next.js app. Ensure env values are set in the target environment and run `npx prisma migrate deploy` before starting the server.
=======
Riwaazo is a digital event infrastructure platform offering marketplace discovery, vendor CRM, workflow automation, and AI-powered event execution tools.
>>>>>>> origin/main
