# Glow Diaries Healthcare Skincare Portal

Personalized skincare web app with user login, profile onboarding, face analysis, product recommendations, weekly progress tracking, product CRUD, and contact details.

## Features

| Feature | Description |
|--------|-------------|
| **Login / Register** | Secure session with email and password |
| **Profile** | Name, age, gender after first login |
| **Skin analysis** | Enter face type and concerns, or upload a photo |
| **Recommendations** | Glow Diaries Cleanser, Facial Toner, Serum, Moisturizer |
| **Weekly reports** | Upload weekly photos; scores and week-over-week comparison |
| **Product CRUD** | Admins manage products at `/products/manage` |
| **Contact** | Form + company contact details |
| **Admin dashboard** | `/admin` — stats, users, contact inbox (admin only) |
| **Email notifications** | Welcome, analysis results, weekly reports, contact (SMTP or console) |
| **AI vision** | Optional OpenAI analysis when `OPENAI_API_KEY` is set |

## Quick start

Requires [Node.js](https://nodejs.org/) 18+.

```bash
cd Glow Diaries-skincare
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo flow

1. **Register** → complete **profile** (name, age, gender).
2. Go to **Skin Analysis** — select concerns and/or upload a face photo.
3. Review face type, analysis text, and recommended products.
4. Each week, open **Weekly Reports** and upload a progress photo.
5. **Admin**: sign in as `admin@Glow Diaries.com` / `Admin123!` (after seed) → **Admin** → product CRUD & messages.
6. **Contact** for support details and message form.

### Admin login

After `npm run db:seed`:

- **Email:** `admin@Glow Diaries.com` (or your `ADMIN_EMAIL`)
- **Password:** `Admin123!` (or your `ADMIN_PASSWORD`)

Registering with the same email as `ADMIN_EMAIL` also grants admin role.

## Face analysis

- **Without OpenAI:** local image metrics + your answers.
- **With `OPENAI_API_KEY`:** GPT vision analyzes the photo, merged with local metrics (`ai+local`).

This is cosmetic guidance, not medical diagnosis.

## Email notifications

When SMTP is configured, emails are sent for:

- New user welcome
- Skin analysis results
- Weekly report saved
- Contact form (admin + user confirmation)

Without SMTP, messages are **printed to the server console** (dev-friendly).

Configure in `.env`:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-user
SMTP_PASS=your-password
EMAIL_FROM=Glow Diaries <noreply@Glow Diaries.com>
ADMIN_EMAIL=support@Glow Diaries.com
```

## AI vision (OpenAI)

```env
OPENAI_API_KEY=sk-your-key
OPENAI_VISION_MODEL=gpt-4o-mini
```

Upload a face photo on **Skin Analysis** to trigger AI + local analysis.

## Tech stack

- Next.js 15 (App Router)
- Prisma + SQLite
- JWT session cookies
- Sharp for image processing
- OpenAI Vision API (optional)
- Nodemailer for email (optional)
- Tailwind CSS 4

## Environment

Copy `.env.example` to `.env`. Key variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLite path |
| `JWT_SECRET` | Session signing |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed admin account |
| `OPENAI_API_KEY` | AI photo analysis |
| `SMTP_*` / `EMAIL_FROM` | Outgoing email |

After schema changes, run `npm run db:push` again and re-login to refresh your session.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:push` | Apply database schema |
| `npm run db:seed` | Seed four Glow Diaries products |
