# eBarangay system documentation

Single-barangay digital hall software for resident registry, certificates, complaints, announcements, and related hall records.

This is **not** a multi-LGU platform. A barangay resolution, official seal, hosting, and regular `pg_dump` backups are still required before real use.

| | |
|---|---|
| **Author** | Hansel Mejarito Jr. |
| **Live demo** | [https://e-barangay-ph.vercel.app](https://e-barangay-ph.vercel.app) |
| **Source** | [hanselmejarito/eBarangay](https://github.com/hanselmejarito/eBarangay) |

---

## Table of contents

1. [What it does](#1-what-it-does)
2. [Who can use it](#2-who-can-use-it)
3. [Public website](#3-public-website)
4. [Resident portal](#4-resident-portal)
5. [Staff hall](#5-staff-hall)
6. [Admin](#6-admin)
7. [Certificates](#7-certificates)
8. [QR resident ID](#8-qr-resident-id)
9. [Announcements and email](#9-announcements-and-email)
10. [Dashboard](#10-dashboard)
11. [Local setup](#11-local-setup)
12. [Environment variables](#12-environment-variables)
13. [Deployment](#13-deployment)
14. [Architecture](#14-architecture)
15. [Security and privacy](#15-security-and-privacy)
16. [Demo accounts](#16-demo-accounts)
17. [Out of scope](#17-out-of-scope)

---

## 1. What it does

eBarangay is a one-stop digital front for a single barangay hall.

| Module | Purpose |
|---|---|
| Household registry | Purok, street address, household number, head of household |
| Residents | Identity, special-category tags, verification, life and residency status |
| Documents | Clearance, residency, indigency, business clearance — with control numbers and PDF |
| Complaints | Service reports (noise, waste, streetlight, and others), not blotter casework |
| Announcements | Official notices; optional email to verified residents |
| Awards | Public list of seals, plaques, and recognitions |
| Officials | Published directory of barangay officials |
| Inventory | Hall property (quantity on hand vs out, condition) |
| Budget | Annual lines by category, expenses, public transparency page |
| Reports | PDF/CSV lists of verified residents (voters, seniors, PWD, and others) |
| Users and audit | Admin-only accounts and an action log |

Seed data uses **Barangay San Roque, Quezon City**. Change this in **Settings** after first login as admin.

---

## 2. Who can use it

| Role | How they get an account | Home after sign-in |
|---|---|---|
| **Resident** | Self-register at `/register`, then wait for staff verification | `/portal` |
| **Staff** | Created by an admin | `/staff/dashboard` |
| **Admin** | Seeded, or created by another admin | `/staff/dashboard` |

- Staff can do hall work (residents, documents, complaints, announcements, inventory, budget, reports).
- Admin can do everything staff can, plus **Users** and **Audit log**.
- Residents cannot open `/staff` routes. Staff cannot open admin-only pages. Wrong-role visits are sent to that role’s home, not to login.

Account statuses: **Pending verification**, **Active**, **Suspended**. Five failed logins lock the account for 15 minutes.

---

## 3. Public website

No login required.

| Page | Path |
|---|---|
| Home | `/` |
| Register | `/register` |
| Sign in | `/login` |
| Announcements | `/announcements` |
| Awards | `/achievements` |
| Officials | `/officials` |
| Budget transparency | `/budget` |
| Privacy notice | `/privacy` |
| Certificate check | `/verify/certificate/{token}` |
| Resident ID check | `/verify/resident/{token}` |

Logged-in visitors on `/login` or `/register` are redirected to their role home.

---

## 4. Resident portal

After staff verify the resident, the portal can:

1. **Home** — recent document requests and complaints.
2. **Profile** — household membership and contact details.
3. **Documents** — request a certificate for themselves or another **verified, living, active** member of the same household.
4. **Complaints** — file and follow a service complaint (optional photos).
5. **Resident ID** — printable QR ID (only when verified).
6. **Announcements / Awards / Officials** — same public pages, linked from the sidebar.
7. **Password** — change password.

Registration requires a government ID photo, privacy consent, and household information (join an existing household number or request a new one). Until verification, they can sign in but cannot request documents or show a QR ID.

---

## 5. Staff hall

| Menu | Use |
|---|---|
| **Dashboard** | Counts and charts (see [Dashboard](#10-dashboard)) |
| **Residents** | Search, add walk-in records, verify/reject, mark deceased or moved out |
| **Households** | Create and edit households; assign a head |
| **Documents** | Queue, walk-in request, process, issue PDF, mark paid/released |
| **Complaints** | Assign, update status, add resolution notes |
| **Announcements** | Draft, publish, expire; optional email notify |
| **Awards** | Hall recognitions shown on the public site |
| **Officials** | Directory (role, committee, photo) |
| **Inventory** | Items, quantity, condition, location |
| **Budget** | Year lines and expenses |
| **Scan ID** | Paste a scanned QR URL or token to open the resident record |
| **Reports** | Download PDF or CSV by tag |
| **Settings** | Barangay name, address, officials, logo/seal, fees, certificate validity |
| **Password** | Change own password |

### Resident verification

Queue: `/staff/residents/verify`. Staff check the uploaded ID against the census, then verify or reject (with a reason). Only **verified + alive + active** residents can be subjects of certificates.

### Walk-in documents

`/staff/requests/new` files a request on behalf of an eligible resident (no portal account required). The request shows as **Walk-in** on the detail page.

---

## 6. Admin

| Menu | Use |
|---|---|
| **Users** | Create staff/admin, change role/status, reset password |
| **Audit log** | Who did what (login, register, verify, issue, and similar) |

Fees and hall names on PDFs and the homepage come from **Settings** (staff), not from code.

---

## 7. Certificates

Document types:

- Barangay Clearance
- Certificate of Residency
- Certificate of Indigency
- Business Clearance (business name, address, nature)

**Request flow**

```
PENDING → REVIEWING → APPROVED (PDF issued) → RELEASED
                 ↘ REJECTED
```

- Staff may skip straight from pending to **Approve and issue**.
- Approval generates a yearly **control number**, HMAC-signed **verify token**, and a PDF (seal, signatures, QR).
- Validity days come from Settings (seed default: 180).
- Window fees are **Paid / Unpaid** only — no GCash or online checkout.
- Anyone with the certificate QR/link can open `/verify/certificate/{token}` and see type, subject, control number, and validity. They cannot see staff notes.

---

## 8. QR resident ID

Verified residents open **Resident ID** in the portal. The QR encodes a signed URL:

`/verify/resident/{token}`

- Tokens are HMAC-SHA256 using `AUTH_SECRET` (`lib/qr.ts`). A forged QR fails verification.
- The public page shows name, verification badge, and purok — not contact numbers or ID photos.
- Signed-in staff who scan see the fuller record (photo, status, and related fields).
- Hall workflow: **Scan ID** → paste the URL or token from a camera/scanner.

---

## 9. Announcements and email

Staff write title, message, optional cover, priority (normal / high / urgent), publish time, and expiry.

If **Notify verified residents by email** is checked:

- Recipients are **verified, living, active** residents who have an account email (and optionally a mobile for SMS).
- Email is sent through [Resend](https://resend.com) when `RESEND_API_KEY` is set, **and only if the notice is already live** (publish date is now or past, not expired).
- A future publish date hides the notice from the public site **and skips email**. After it goes live, open it again and check notify to send.
- Without the key, the announcement is still saved; email is skipped.

**Resend test mode:** the default sender `onboarding@resend.dev` can only deliver to the email of the Resend account. To reach every resident Gmail, verify a domain in Resend and set `ANNOUNCE_FROM_EMAIL` to an address on that domain.

SMS via Semaphore (`SEMAPHORE_API_KEY`) is optional and not a v1 deliverable. Leave it unset unless you have a Semaphore account.

---

## 10. Dashboard

`/staff/dashboard` (staff and admin):

**Stat cards** — verified residents, households, pending requests, active complaints, certificates this month, seniors, PWD, solo parents, regular voters (18+), SK voters (15–30), budget allocated / spent / remaining.

**Charts**

| Chart | Data |
|---|---|
| Monthly certificates issued | Certificates issued this calendar year, by month |
| Document requests by status | Pending, reviewing, approved, released, rejected |
| Requests by document type | The four certificate types |
| Complaints by category | Noise, waste, streetlight, disturbance, infrastructure, other |
| Verified residents by purok | Verified + alive + active, grouped by household purok |
| Budget by category | Allocated vs spent for the current year |

Empty series show “No data yet”.

---

## 11. Local setup

Requirements: Node.js 20+, Docker (for PostgreSQL), npm.

```bash
cp .env.example .env
# Set AUTH_SECRET (openssl rand -base64 32) and AUTH_URL=http://localhost:3000

docker compose up -d
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful scripts:

| Script | Purpose |
|---|---|
| `npm run dev` | Next.js development server |
| `npm run build` / `npm start` | Production build and serve |
| `npx prisma migrate deploy` | Apply existing migrations |
| `npm run db:seed` | Reset demo data (destructive to existing rows the seed deletes) |
| `npm run db:reset` | Drop DB, migrate, seed |

Local files go to `./uploads` (see `UPLOAD_DIR`). Do not point local `.env` at a live Supabase URL unless you intend to write to that project.

---

## 12. Environment variables

See `.env.example`.

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL. Local: `postgresql://ebarangay:ebarangay@localhost:5432/ebarangay` |
| `AUTH_SECRET` | Yes | JWT and QR HMAC. Use a long random string. |
| `AUTH_URL` | Yes | Public origin, e.g. `http://localhost:3000` or the Vercel URL |
| `UPLOAD_DIR` | Local | Default `./uploads` |
| `SUPABASE_URL` | Vercel uploads | Private Storage; leave unset locally |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel uploads | Server-only; never expose to the browser |
| `SUPABASE_STORAGE_BUCKET` | Optional | Default `ebarangay` |
| `RESEND_API_KEY` | Email notify | Without it, the notify checkbox does not send mail |
| `ANNOUNCE_FROM_EMAIL` | Optional | Default `Barangay Hall <onboarding@resend.dev>` |
| `SEMAPHORE_API_KEY` | Optional | SMS; unused in typical installs |

---

## 13. Deployment

Typical live stack: **Vercel** (app) + **Supabase** (Postgres + Storage) + **Resend** (email).

1. Create a Supabase project. Use the **session pooler** `DATABASE_URL` on port **5432** for `prisma migrate deploy` (transaction pooler on 6543 often fails migrations).
2. Set all required env vars on Vercel (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`).
3. For ID photos, certificates, and covers on Vercel, set the three `SUPABASE_*` variables. The app filesystem is ephemeral; local `./uploads` will not persist.
4. Run `npx prisma migrate deploy` against the live database (CI, `vercel` build, or a one-off with the session-pooler URL).
5. Optionally seed once, then change Settings and demo passwords.
6. Add `RESEND_API_KEY` (and a verified domain) before using announcement email.

Do not connect the GitHub repo to Supabase as a linked app unless you intend that integration. The app only needs the connection string and, for files, the Storage service role.

Backups: schedule `pg_dump` (or Supabase backups). Certificates and uploads live in Storage or `UPLOAD_DIR` — back those up too.

---

## 14. Architecture

| Layer | Choice |
|---|---|
| App | Next.js 16 App Router, React 19, TypeScript |
| UI | Tailwind CSS v4, shadcn/ui |
| Database | PostgreSQL 16, Prisma 6 |
| Auth | Auth.js v5 credentials + JWT; `sessionVersion` invalidates sessions |
| Validation | Zod on Server Actions |
| PDFs / QR | pdf-lib, qrcode |
| Charts | Recharts |

**Route groups**

- `app/(public)` — marketing and verify pages
- `app/(portal)` — resident
- `app/(staff)` — staff and admin
- `app/api` — Auth.js, file serving, resident reports

**Request gate:** `proxy.ts` (Next.js 16; not `middleware.ts`). It only checks for a session cookie on `/portal` and `/staff`, and bounces logged-in users off `/login` and `/register`. Role checks run in `lib/rbac.ts` on the page.

**Domain code** lives under `features/` (forms and server actions) and `lib/` (Prisma helpers, PDF, QR, notify, files).

**Prisma:** stay on Prisma 6. After schema changes, add a SQL helper if the generated client is stale, and bump `CLIENT_GEN` in `lib/prisma.ts`.

**Uploads:** `lib/files.ts` writes to disk when Supabase env is absent, or to a private Storage bucket when it is set. Files are served through `/api/files/...`, not as public bucket URLs.

---

## 15. Security and privacy

- Passwords hashed with bcrypt.
- Sessions are JWT; increment `sessionVersion` (password change, suspend) to revoke them.
- Login lockout after five failures.
- Household-scoped document requests: a resident may only request for members of their household.
- Certificate and resident QR tokens are HMAC-signed; verification pages omit sensitive fields for the public.
- Privacy notice: `/privacy` (Data Privacy Act of 2012). The **barangay** is the personal information controller; this software is the tool.
- There is no full data-subject export/erasure UI in v1 — handle those requests at the hall.

---

## 16. Demo accounts

Created by `npm run db:seed`:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@ebarangay.local` | `Admin123!` |
| Staff | `staff@ebarangay.local` | `Staff123!` |
| Resident (verified) | `juan@ebarangay.local` | `Resident123!` |
| Resident (pending) | `ana@ebarangay.local` | `Resident123!` |

Change these before any real hall deployment.

---

## 17. Out of scope (v1)

- Katarungang Pambarangay / blotter casework
- Multi-barangay tenancy
- GCash or other online payments
- Guaranteed SMS to all residents
- Full data-subject export and erasure screens
- Replacing a barangay resolution, wet-ink seal, or off-site backups
