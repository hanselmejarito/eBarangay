# eBarangay

Single-barangay digital services: household registry, verified resident accounts, official certificates, complaints, announcements, and signed QR IDs.

This is hall software, not a multi-LGU platform. A barangay resolution, official seal, hosting, and `pg_dump` backups are still required before real use. Katarungang Pambarangay / blotter, SMS, and GCash are out of scope for v1.

## Stack

- Next.js (App Router) · React · TypeScript · Tailwind CSS · shadcn/ui
- PostgreSQL · Prisma
- Auth.js v5 (credentials + JWT with `sessionVersion` revocation)
- Zod · Server Actions · pdf-lib · QR (HMAC-signed)

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

Generate `AUTH_SECRET` (`openssl rand -base64 32`).

2. Start PostgreSQL:

```bash
docker compose up -d
```

3. Migrate and seed:

```bash
npm install
npx prisma migrate deploy
npm run db:seed
```

4. Run the app:

```bash
npm run dev
```

## Demo accounts

| Role     | Email                     | Password      |
|----------|---------------------------|---------------|
| Admin    | admin@ebarangay.local     | Admin123!     |
| Staff    | staff@ebarangay.local     | Staff123!     |
| Resident | juan@ebarangay.local      | Resident123!  |
| Pending  | ana@ebarangay.local       | Resident123!  |

## Roles

- **Resident** — register, request documents for household members, complaints, QR ID after verification
- **Staff** — verify residents, process requests, complaints, announcements
- **Admin** — everything staff can do, plus users, settings, and audit log

Staff accounts are created by an admin. Residents self-register and wait in the verification queue.

## Out of scope (v1)

- Blotter / Katarungang Pambarangay casework
- Multi-barangay tenancy
- SMS / GCash / online payments (window fees are marked paid/unpaid)
- Full data-subject export/erasure UI
