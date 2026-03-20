# Riwaazo Frontend Readiness (Pre-backend)

## Routes (implemented vs checklist)
- Public: `/`, `/home`, `/venues`, `/venues/[venueId]`, `/vendors`, `/vendors/[vendorId]`, `/planner`, `/budget`, `/login`, `/signup`
- Authenticated: `/dashboard`, `/dashboard/events`, `/dashboard/events/[eventId]`
- Vendor: `/vendor/dashboard`, `/vendor/bookings`, `/vendor/services`
- Venue: `/venue/dashboard`, `/venue/calendar`
- Admin: `/admin`, `/admin/dashboard`, `/admin/announcements`, `/admin/settings`
- Gaps to wire navigation: link to the above where needed.

## Data requirements per page (UI → fields)
- Venues list: `venueId, name, location, capacityMin, capacityMax, priceStarting, rating, thumbnail`
- Venue detail: `venueId, name, description, location, priceStarting, rating, reviewCount, capacity, amenities[], highlights[], photos[], availability[], packages[], contactInfo`
- Vendors list: `vendorId, name, category, location, priceRange, rating, thumbnail`
- Vendor detail: `vendorId, services[], portfolio[], availability[], reviews[], contactInfo`
- Planner: `milestones[], dueDate, owner, status, budgetLinkedLineId`
- Budget: `lineId, category, allocated, spent, status, owner`
- Dashboard (user): `events[], savedVenues[], savedVendors[], messages[], notifications[], tasks[], budgetTotals`
- Dashboard events detail: `eventId, name, date, venueId, vendors[], guests, budget, timeline, tasks, notes`
- Admin: `queues (vendors/venues), bookings, users, content drafts, settings toggles, announcements`
- Role selection: `role, userId`

## Form inventory (fields & validation outline)
- Login: `email (email)`, `password (min 8)`
- Signup: `name (required)`, `email (email)`, `password (min 8)`, `confirmPassword`, `role`
- Role select: `role (enum: customer|vendor|venue|admin)`
- Contact: `name, email, phone, message`
- Planner milestone: `title, dueDate, owner, status`
- Budget line: `category, allocated (number>0), owner`
- Announcement: `title, audience, body`
- Venue booking flow: `date, guestCount, eventType, notes`
- Vendor application (needed): `companyName, category, city, priceRange, portfolioUrl`
- Password reset (needed): `email`, OTP step
- Booking confirmation (needed): `paymentMethod, termsAccepted`

## API contract sketch
- Venues: `GET /venues`, `GET /venues/{id}`, `POST /venues/{id}/visit`, `POST /venues/{id}/book`
- Vendors: `GET /vendors`, `GET /vendors/{id}`, `POST /vendors/{id}/book`
- Events: `GET /events`, `GET /events/{id}`, `POST /events`, `PATCH /events/{id}`
- Tasks: `GET /events/{id}/tasks`, `POST /events/{id}/tasks`
- Budget: `GET /budget`, `POST /budget`, `PATCH /budget/{lineId}`
- Messages: `GET /messages`, `POST /messages/{id}/read`
- Notifications: `GET /notifications`, `POST /notifications/{id}/read`
- Auth: `POST /signup`, `POST /login`, `POST /otp/verify`, `POST /password/reset`
- Admin: `GET /admin/queues`, `POST /admin/announcements`

## Entities (pre-schema)
- User { id, name, email, role, phone, city }
- Venue { id, ownerId, name, location, capacityMin, capacityMax, priceStarting, rating }
- Vendor { id, ownerId, name, category, city, priceRange, rating }
- Event { id, userId, venueId, date, guests, status, budgetId }
- Booking { id, eventId, venueId?, vendorId?, amount, status, paymentId }
- BudgetLine { id, eventId, category, allocated, spent, status }
- Message { id, from, to, body, status }
- Notification { id, userId, title, category, read }
- Review { id, userId, targetId, rating, comment }

## Roles & access
- Roles: Customer, Vendor, Venue Owner, Admin (City Host later)
- Dashboards: Customer→/dashboard, Vendor→/vendor/dashboard, Venue→/venue/dashboard, Admin→/admin/dashboard
- Access control plan: gate routes by role (middleware or layout guard) after auth is wired.

## State management plan
- MVP: React Context for auth/session, user profile, favorites; co-locate fetch hooks per page.
- Upgrade path: Zustand/Redux for cross-page event/budget/task state; SWR/React Query for server cache.
- Persistence: tokens via httpOnly cookie; localStorage only for non-sensitive UI prefs.

## Booking flow (UI placeholder → backend needs)
1) Venue detail: select date + guests → create event draft
2) Choose visit or direct book → call `/venues/{id}/visit` or `/venues/{id}/book`
3) Event created → redirect `/dashboard/events/{eventId}` with tasks and budget line

## Error/loading/empty states
- Add: loading skeletons for lists, empty states for dashboards, error banners on fetch failures, retry buttons.

## Analytics prep
- Reserve GA slot + event tracking (page view, search, booking CTA click, form submit).
