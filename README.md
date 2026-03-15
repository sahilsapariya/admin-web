# School ERP Admin Web Panel

Next.js App Router admin panel for School ERP. Consumes the existing Flask backend APIs.

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **Shadcn UI** (Radix primitives + CVA)
- **React Query v5**
- **React Hook Form** + **Zod** validation

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/       # Login page
│   ├── (dashboard)/        # Protected routes
│   │   ├── dashboard/
│   │   ├── students/
│   │   ├── teachers/
│   │   ├── classes/
│   │   ├── attendance/
│   │   └── profile/
│   ├── layout.tsx          # Root layout (providers)
│   └── globals.css
├── components/
│   ├── layout/             # DashboardLayout, Sidebar, Header, ProtectedRoute
│   ├── providers/          # AuthProvider, QueryProvider, Providers
│   ├── tables/             # Reusable table components
│   ├── forms/              # Form components
│   └── ui/                 # Shadcn UI (Button, Input, Label, Card)
├── hooks/
├── services/               # API client, authService
├── lib/                    # utils, storage, constants
├── types/
└── middleware.ts           # Route protection (session cookie)
```

## Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Configure API URL (default dev: `http://localhost:5001`):
   ```
   NEXT_PUBLIC_API_URL_DEV=http://localhost:5001
   NEXT_PUBLIC_API_URL=https://your-backend.com
   ```

3. Install and run:
   ```bash
   npm install
   npm run dev
   ```

## Features

- **Auth**: Login with email/password, tenant selection when user has multiple schools
- **Route protection**: Middleware + ProtectedRoute component (session cookie + client-side)
- **API client**: Typed fetch with token refresh, tenant header, standardized error handling
- **React Query**: Provider configured for data fetching
- **Sidebar navigation**: Dashboard, Students, Teachers, Classes, Attendance, Profile

## Backend Integration

The panel calls the same APIs as the mobile app:

- `POST /api/auth/login` — Login
- `GET /api/auth/profile` — User profile
- `GET /api/students/`, `POST /api/students/`, etc.
- `GET /api/teachers/`, etc.
- See `OVERVIEW_NEW.md` for full API reference.
