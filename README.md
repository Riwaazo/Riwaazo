# Riwaazo

Riwaazo is a digital event infrastructure platform offering marketplace discovery, vendor CRM, workflow automation, and AI-powered event execution tools. Built with Next.js (App Router), TypeScript, Tailwind, Prisma, and Supabase Auth/Postgres.

## Quick start

```bash
npm install
npx prisma migrate dev
npm run dev
```

App runs at http://localhost:3000.

## Environment

Copy `.env.example` to `.env` (if present) and set:

- `DATABASE_URL` (Postgres/Supabase)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (only for server actions/edge if required)

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — run compiled app
- `npm run lint` — lint
- `npx prisma migrate dev` — apply migrations locally

## Features (current)

- Admin panel: vendor/venue approvals with status + notifications; booking status updates with notifications
- Auth via Supabase (roles: admin/vendor/venue/event-planner/user)
- Marketplace pages for vendors/venues; dashboards per role
- Prisma schema synced to migrations in `prisma/migrations`

## Deployment

Standard Next.js build. Ensure env values are set in the target environment and run `npx prisma migrate deploy` before starting the server.
