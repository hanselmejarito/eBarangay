# eBarangay

Single-barangay digital hall: household registry, verified resident accounts, official certificates, complaints, announcements, budget transparency, and signed QR IDs.

This is hall software, not a multi-LGU platform. A barangay resolution, official seal, hosting, and `pg_dump` backups are still required before real use.

| | |
|---|---|
| **Author** | Hansel Mejarito Jr. |
| **Live demo** | [https://e-barangay-ph.vercel.app](https://e-barangay-ph.vercel.app) |
| **Documentation** | [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md) |

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui
- PostgreSQL · Prisma 6
- Auth.js v5 (credentials + JWT with `sessionVersion` revocation)
- Zod · Server Actions · pdf-lib · HMAC-signed QR · Recharts

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

Generate `AUTH_SECRET` (`openssl rand -base64 32`). Keep `AUTH_URL=http://localhost:3000`.

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

Open [http://localhost:3000](http://localhost:3000). Full setup, roles, modules, email, and Vercel notes: **[Documentation](docs/DOCUMENTATION.md)**.

## Demo accounts

| Role     | Email                     | Password      |
|----------|---------------------------|---------------|
| Admin    | admin@ebarangay.local     | Admin123!     |
| Staff    | staff@ebarangay.local     | Staff123!     |
| Resident | juan@ebarangay.local      | Resident123!  |
| Pending  | ana@ebarangay.local       | Resident123!  |

## Roles

- **Resident** — register, request documents for household members, complaints, QR ID after verification
- **Staff** — verify residents, process requests, complaints, announcements, inventory, budget, reports, hall settings
- **Admin** — everything staff can do, plus users and audit log

Staff accounts are created by an admin. Residents self-register and wait in the verification queue.

## Out of scope (v1)

- Blotter / Katarungang Pambarangay casework
- Multi-barangay tenancy
- SMS / GCash / online payments (window fees are marked paid/unpaid)
- Full data-subject export/erasure UI
