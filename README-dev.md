# Riwaazo (dev branch)

Working notes for ongoing development on `dev`.

## Setup

```bash
npm install
npx prisma migrate dev
npm run dev
```

Env: set `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` if server actions need it.

## Admin changes (dev)
- Vendor/venue approvals backed by `ApprovalStatus` enum; admin APIs at `/api/admin/vendors` and `/api/admin/venues` send notifications on approve/reject.
- Booking moderation at `/api/admin/bookings` (confirm/cancel) with notifications to user/vendor/venue owner.
- Non-admin vendor/venue listings only show approved records.

## Useful scripts
- `npm run dev` — start Next.js dev server
- `npm run lint` — lint
- `npx prisma migrate dev` — apply migrations locally
- `npx prisma migrate deploy` — deploy migrations in prod

## Branching
- `dev`: integration branch (this file)
- `main`: release branch (see README.md)

Push workflow: develop on `dev`, open PR to `main` after verification.
