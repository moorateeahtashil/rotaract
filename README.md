# Rotaract Club Platform

A modern, production-ready website and management platform for a Rotaract club. Built with Next.js 15, Supabase, and Tailwind CSS.

## Features

### Public Website
- **Home** — Dynamic, admin-editable homepage with reorderable sections
- **About Rotaract** — Information about the Rotaract program
- **About Rotary** — Rotary International overview
- **About Our Club** — Club history, mission, meeting details
- **Leadership** — Current and past board members
- **Members** — Public member directory
- **Avenues of Service** — Six pathways with related projects/events
- **Projects** — Filterable project listings with detail pages
- **Events & Calendar** — Upcoming/past events with registration
- **News & Updates** — Blog/news CMS with categories and search
- **Join Us** — Membership recruitment with inquiry form
- **Contact** — Multi-type contact forms with admin inbox
- **Sponsors** — Sponsor Rotary club profiles
- **Gallery** — Photo albums and media
- **FAQ** — Categorized frequently asked questions
- **Privacy / Terms** — Legal pages

### Member Portal (authenticated)
- Dashboard with stats, announcements, upcoming events
- Profile management
- Event browsing and registration
- Meeting bookings
- Member directory
- Resources/downloads

### Admin Dashboard (role-based access)
- Overview dashboard with metrics and charts
- Site settings management
- Navigation editor
- Homepage section editor (reorder, toggle, customize)
- Members management (create, edit, status, roles)
- Board members management
- Avenues of Service management
- Projects CRUD with images, team, SEO
- Events CRUD with registration management
- News/Blog CMS with rich content
- Gallery/media library
- Contact inquiries inbox
- Membership applications pipeline
- Bookings management
- Email templates
- Reminder configuration
- Analytics
- User roles & permissions
- Audit logs

### Email System
- Template-based emails using Resend
- Contact form acknowledgment + admin notification
- Membership inquiry confirmation
- Event registration confirmation
- Booking confirmation
- Welcome new member
- Admin-editable templates with variable placeholders

### Reminder Automation
- Cron-based scheduler (Vercel Cron compatible)
- Event reminders (24h before)
- Booking reminders (24h before)
- Membership application follow-up
- Configurable timing from admin
- Prevents duplicate sends
- Full logging

### Security & Access Control
- Supabase Auth with SSR cookie sessions
- 12-level role hierarchy (super_admin → public)
- Row Level Security (RLS) policies
- Server-side route guards
- Granular permissions per entity type
- Audit logging

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui + Radix UI primitives |
| Icons | Lucide React |
| Animation | Framer Motion |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table |
| Charts | Recharts |
| Calendar | FullCalendar |
| Rich Text | Tiptap |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Email | Resend |
| Deployment | Vercel |

## Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-rotary-blue` | `#17458f` | Primary brand |
| `--color-rotary-gold` | `#f7a81b` | Primary CTA |
| `--color-azure` | `#0067c8` | Secondary CTA |
| `--color-sky-blue` | `#00a2e0` | Supporting accent |
| `--color-cranberry` | `#d41367` | Rotaract accent |
| `--color-turquoise` | `#00adbb` | Supporting accent |
| `--color-charcoal` | `#54565a` | Body text |

Typography: Open Sans (headings and body)

## Getting Started

### Prerequisites
- Node.js 20+
- npm or pnpm
- Supabase project (free tier works)
- Resend account (for email)

### 1. Clone & Install

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Rotaract Club

# Cron (generate a random secret)
CRON_SECRET=your-cron-secret

# UploadThing (optional)
UPLOADTHING_SECRET=sk_xxx
UPLOADTHING_APP_ID=xxx
```

### 3. Database Setup

#### Option A: Using Supabase CLI
```bash
# Apply migrations
npx supabase db push

# Seed demo data
npx supabase db push --db-url postgresql://postgres:postgres@127.0.0.1:54322/postgres
# Or run seed SQL manually in Supabase SQL Editor
```

#### Option B: Manual
1. Open your Supabase dashboard → SQL Editor
2. Run `supabase/migrations/001_initial_schema.sql`
3. Run `supabase/migrations/002_additional_tables.sql`
4. Run `supabase/seed/001_seed_data.sql` for demo data

### 4. Create Admin User

1. Sign up via the app at `/signup`
2. In Supabase SQL Editor, assign the super_admin role:
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('<your-user-id-from-auth>', 'super_admin');
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Build for Production

```bash
npm run build
npm run start
```

## Project Structure

```
├── app/
│   ├── (public)/          # Public website pages
│   │   ├── page.tsx       # Dynamic homepage
│   │   ├── projects/      # Projects listing + detail
│   │   ├── events/        # Events listing + detail
│   │   ├── news/          # Blog listing + detail
│   │   ├── about/         # About pages
│   │   ├── join/          # Membership page
│   │   ├── contact/       # Contact page
│   │   ├── leadership/    # Board members
│   │   ├── members/       # Member directory
│   │   ├── avenues-of-service/
│   │   ├── sponsors/
│   │   ├── gallery/
│   │   ├── faq/
│   │   ├── privacy/
│   │   ├── terms/
│   │   └── maintenance/
│   ├── (auth)/            # Login, signup, password reset
│   ├── (member)/          # Member portal
│   │   ├── page.tsx       # Member dashboard
│   │   ├── profile/
│   │   ├── events/
│   │   ├── bookings/
│   │   ├── announcements/
│   │   ├── directory/
│   │   └── resources/
│   ├── (admin)/           # Admin dashboard
│   │   ├── page.tsx       # Admin overview
│   │   ├── settings/
│   │   ├── members/
│   │   ├── board/
│   │   ├── projects/
│   │   ├── events/
│   │   ├── news/
│   │   ├── avenues/
│   │   ├── bookings/
│   │   ├── gallery/
│   │   ├── emails/
│   │   ├── analytics/
│   │   └── users/
│   ├── api/
│   │   ├── cron/reminders/  # Reminder cron job
│   │   ├── sitemap/         # Dynamic sitemap.xml
│   │   └── robots/          # Dynamic robots.txt
│   ├── layout.tsx
│   ├── globals.css
│   ├── error.tsx
│   ├── loading.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/                # shadcn/ui primitive components
│   ├── layout/            # Header, footer, sidebars
│   ├── admin/             # Admin sidebar, topbar
│   ├── join/              # Membership form
│   └── contact/           # Contact form
├── lib/
│   ├── db/
│   │   ├── client.ts      # Supabase clients (browser, server, service)
│   │   ├── types.ts       # Auto-generated DB types
│   │   └── queries.ts     # Server-side data fetching
│   ├── auth/
│   │   ├── session.ts     # Session/user/role helpers
│   │   └── guards.ts      # Server-side route guards
│   ├── actions/
│   │   └── index.ts       # Server actions (CRUD operations)
│   ├── email/
│   │   ├── index.ts       # Resend client, sendEmail()
│   │   └── templates.ts   # Template rendering, specific email flows
│   ├── validators/        # Zod schemas for all forms
│   ├── constants/         # Brand colors, routes, defaults
│   ├── utils/             # cn(), slugify, formatters, etc.
│   └── config/
│       └── site.ts        # Site config from DB settings
├── hooks/
│   └── use-toast.ts       # Toast notification hook
├── providers/
│   └── theme-provider.tsx # next-themes provider
├── supabase/
│   ├── migrations/        # SQL migrations
│   └── seed/              # Demo seed data
├── middleware.ts           # Supabase SSR + route protection
└── next.config.ts
```

## Database Schema

30+ tables covering:
- Authentication & profiles
- Members & board positions
- Committees & committee members
- Avenues of service
- Projects with images and team
- Events with registrations and waitlist
- Booking types, slots, and bookings
- Contact inquiries
- Membership applications
- Posts/blog with categories and tags
- Media files and albums
- Sponsor clubs
- Email templates and logs
- Reminder rules and logs
- Announcements
- Documents/resources
- Audit logs
- Attendance records
- Volunteer hours

See `supabase/migrations/` for the complete schema.

## Role Hierarchy

| Role | Level | Permissions |
|------|-------|-------------|
| `super_admin` | 0 | Full access to everything |
| `admin` | 1 | Full access |
| `president` | 2 | All content management |
| `secretary` | 3 | Content + communications |
| `public_image_director` | 4 | Homepage, blog, gallery |
| `membership_director` | 5 | Members, applications |
| `project_director` | 6 | Projects only |
| `event_manager` | 7 | Events, bookings only |
| `board_member` | 8 | Admin dashboard access |
| `member` | 9 | Member portal only |
| `applicant` | 10 | Limited access |
| `public` | 11 | Public website only |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Cron Jobs

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

Or use GitHub Actions / external cron service to hit `/api/cron/reminders` with `Authorization: Bearer $CRON_SECRET`.

### Supabase Storage

Create storage buckets for:
- `avatars` — Member profile photos
- `projects` — Project images
- `events` — Event images
- `posts` — Blog featured images
- `documents` — Downloadable resources
- `media` — General media

Set buckets to public read.

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript check
npm run db:generate  # Generate Supabase types
npm run db:reset     # Reset local Supabase
npm run db:seed      # Seed local Supabase
```

## Customization

### Homepage Sections
Admins can reorder, toggle visibility, and edit content of homepage sections from the admin dashboard. Available section types:
- Hero (banner)
- Meeting info
- Impact stats
- Featured projects
- Upcoming events
- Avenues of service
- Board preview
- News preview
- Sponsor acknowledgment
- CTA banner
- Newsletter signup

### Site Settings
All site-wide settings (club name, contact info, social links, meeting details, SEO defaults) are editable from Admin → Settings.

### Navigation
Menu items are database-driven. Edit from Admin → Navigation.

### Email Templates
All transactional email templates are editable from Admin → Emails. Supports `{{variable}}` placeholders.

## License

This project is built for the Rotaract community. Use it to power your club's digital presence.

## Support

For issues, questions, or contributions, reach out through the club's contact page or district communication channels.
