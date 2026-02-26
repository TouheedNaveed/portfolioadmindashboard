# AdminHub — Admin Dashboard

Full-stack admin dashboard for managing portfolio contact form submissions.

## Tech Stack

| Layer    | Tech                                          |
|----------|-----------------------------------------------|
| Frontend | React 18, TypeScript, Vite, Tailwind, Zustand |
| Backend  | Node.js, Express, TypeScript                  |
| Database | Supabase (PostgreSQL)                         |
| Auth     | JWT (access 15min + refresh 7d, httpOnly)     |

## Quick Start

### 1. Configure Environment

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` with your Supabase credentials and secrets:
- `SUPABASE_URL` — from Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase API settings (⚠️ keep secret)
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — any random 256-bit strings
- `ADMIN_SECRET` — your chosen invite code for signup
- `RESEND_API_KEY` — for password reset emails (optional for dev)

### 2. Install Dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Run

```bash
# Terminal 1 — Backend on port 4000
cd server && npm run dev

# Terminal 2 — Frontend on port 5173
cd client && npm run dev
```

### 4. Create Admin Account

1. Visit `http://localhost:5173/signup`
2. Fill in all fields, using your `ADMIN_SECRET` as the invite code
3. You'll be redirected to the dashboard

## API Endpoints

| Method | Endpoint                  | Auth  | Description             |
|--------|---------------------------|-------|-------------------------|
| POST   | /api/auth/signup          | None  | Create admin account    |
| POST   | /api/auth/login           | None  | Login                   |
| POST   | /api/auth/refresh         | Cookie| Refresh access token    |
| POST   | /api/auth/logout          | Cookie| Logout                  |
| POST   | /api/auth/forgot-password | None  | Send reset email        |
| GET    | /api/auth/verify-reset-token/:token | None | Verify reset link |
| POST   | /api/auth/reset-password  | None  | Set new password        |
| GET    | /api/contacts             | JWT   | List contacts (paginated)|
| GET    | /api/contacts/stats       | JWT   | Dashboard stats         |
| GET    | /api/contacts/:id         | JWT   | Get single contact      |
| PATCH  | /api/contacts/:id/read    | JWT   | Toggle read status      |
| DELETE | /api/contacts/:id         | JWT   | Delete contact          |
| PATCH  | /api/contacts/bulk-read   | JWT   | Bulk update read status |
