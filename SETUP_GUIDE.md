# 🚀 Complete Setup & Running Guide

## 📋 App Overview

This is a **full-featured Rotaract Club Management Platform** with:
- ✅ Public website (18+ pages)
- ✅ Member portal (authenticated)
- ✅ Admin dashboard (role-based access)
- ✅ Email system (Resend integration)
- ✅ Reminder automation (cron jobs)
- ✅ Complete CMS for all content
- ✅ Rotary RSS feed integration
- ✅ Rotary brand-compliant UI/UX

---

## 🎯 STEP-BY-STEP SETUP

### Prerequisites

Before you begin, ensure you have:
- **Node.js 20+** — Verify: `node --version`
- **npm** — Verify: `npm --version`
- **Supabase account** (free tier works) — [supabase.com](https://supabase.com)
- **Resend account** (free tier) — [resend.com](https://resend.com)

---

### Step 1: Install Dependencies

```bash
cd /Users/moorateeahtashil/Documents/projects/rotaract
npm install
```

This installs all required packages including:
- Next.js 15 (App Router)
- Supabase client
- Tailwind CSS v4
- shadcn/ui components
- FullCalendar, Tiptap, Recharts, etc.

---

### Step 2: Environment Variables

Create your environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# ── Supabase (from your Supabase project dashboard) ──
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ── Email (from Resend dashboard) ──
RESEND_API_KEY=re_your-api-key-here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# ── App Configuration ──
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Rotaract Club"

# ── Cron Job Secret (generate random string) ──
CRON_SECRET=your-random-secret-here

# ── UploadThing (Optional - can use Supabase Storage) ──
UPLOADTHING_SECRET=sk_live_your-key-here
UPLOADTHING_APP_ID=your-app-id-here
```

**Where to find these values:**
- **Supabase**: Go to your project → Settings → API
- **Resend**: Go to API Keys → Create new key

---

### Step 3: Database Setup

#### Option A: Using Supabase Dashboard (Recommended)

1. Open your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run the following files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_additional_tables.sql`
4. (Optional) For demo data, run files in `supabase/seed/`

#### Option B: Using Supabase CLI

```bash
# Link to your project
npx supabase link --project-ref your-project-ref

# Apply migrations
npx supabase db push
```

---

### Step 4: Create Storage Buckets

In Supabase Dashboard → **Storage**, create these buckets:

1. `avatars` — Member profile photos
2. `projects` — Project images
3. `events` — Event images
4. `posts` — Blog/news featured images
5. `documents` — Downloadable resources
6. `media` — General media

**Important**: Set all buckets to **public read** access.

---

### Step 5: Create Admin User

1. Start the dev server (see Step 6)
2. Visit `http://localhost:3000/signup` and create an account
3. In Supabase SQL Editor, assign yourself super_admin role:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('<your-user-id-from-auth>', 'super_admin');
```

You can find your user ID in Supabase → Authentication → Users.

---

### Step 6: Run Development Server

```bash
npm run dev
```

Open your browser to: **http://localhost:3000**

The dev server runs with Turbopack for faster builds.

---

### Step 7: Build for Production

```bash
# Build optimized production bundle
npm run build

# Run production server
npm run start
```

---

## 🎨 ROTARY BRAND COMPLIANCE

### ✅ Implemented Features

#### 1. **Official Rotary Colors**
All colors match Rotary International brand guidelines:

| Token | Hex Code | Usage |
|-------|----------|-------|
| Rotary Blue | `#17458f` | Primary brand, headers, links |
| Rotary Gold | `#f7a81b` | Primary CTA buttons, accents |
| Azure | `#0067c8` | Secondary CTA, gradients |
| Sky Blue | `#00a2e0` | Supporting accent |
| Cranberry | `#d41367` | Rotaract accent |
| Turquoise | `#00adbb` | Supporting accent |
| Charcoal | `#54565a` | Body text |
| Pewter | `#898a8d` | Secondary text |

See: `app/globals.css` and `lib/constants/index.ts`

#### 2. **Typography: Open Sans**
- ✅ Font family: Open Sans (all weights: 300-700)
- ✅ Used for headings, body, buttons, forms
- ✅ Matches Rotary brand guidelines

#### 3. **Logo Implementation**
- ✅ Rotary wheel SVG component created
- ✅ Supports full logo, wheel only, wordmark, club name
- ✅ Rotaract-specific variant included
- ✅ Custom logo URL support (from Supabase storage)

**File**: `components/layout/rotary-logo.tsx`

#### 4. **Header Structure** (Rotary Quick Start Guide compliant)
- ✅ Logo in header (Rotary Masterbrand)
- ✅ Clear navigation with dropdowns
- ✅ Sign In and Join Us buttons
- ✅ Mobile-responsive menu
- ✅ Sticky header with backdrop blur

**Site Organization** (Page 5 structure from Quick Start Guide):
- Home
- About (Rotaract, Rotary, Our Club, Leadership)
- Members
- Service (Projects, Events, Avenues)
- News
- Gallery
- FAQ

#### 5. **Footer Structure**
- ✅ Logo and club name
- ✅ Organized link sections (About, Service, Connect, Rotary)
- ✅ Meeting information
- ✅ Contact details
- ✅ Social media links
- ✅ Rotary International links
- ✅ Legal pages (Privacy, Terms)

#### 6. **News & Updates Integration**
- ✅ **Rotary RSS Feed** integrated from `rotary.org/rss.xml`
- ✅ Combines local club news with Rotary International news
- ✅ Shows badges to distinguish sources
- ✅ Falls back to local news if RSS feed fails
- ✅ Cached for 1 hour for performance

**Files**: 
- `lib/utils/rss-parser.ts` (RSS parser)
- `app/(public)/page.tsx` (NewsPreviewSection)

#### 7. **Calls-to-Action (CTAs)**
Implemented throughout landing page:
- ✅ Hero section: "Join Us" + secondary CTA
- ✅ Impact stats section
- ✅ Get Involved section (Volunteer, Donate, Join)
- ✅ Multiple "Join Us" buttons in header/footer
- ✅ Project and event detail pages
- ✅ CTA banner section

#### 8. **Responsive Design**
- ✅ Mobile-first approach
- ✅ Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- ✅ Mobile menu for navigation
- ✅ Grid layouts adapt to screen size
- ✅ Touch-friendly buttons and links

---

## 🖼️ IMAGES & MEDIA

### Using Rotary Brand Center Images

Official Rotary images are available at:
**https://brandcenter.rotary.org/en-us/downloads**

#### How to Add Images:

1. **Download from Brand Center**
   - Visit the link above
   - Download approved photos and logos

2. **Upload to Supabase Storage**
   - Go to Supabase → Storage
   - Choose appropriate bucket (avatars, projects, events, posts, media)
   - Upload your images

3. **Use in Admin Dashboard**
   - Go to Admin → Projects/Events/Posts
   - Add image URLs to the appropriate fields

#### Recommended Image Sizes:
- **Hero banners**: 1920x1080px
- **Project/Event covers**: 1200x630px
- **Blog featured images**: 1200x630px
- **Avatars**: 400x400px (square)

---

## 📰 ROTARY RSS FEED

### How It Works

The landing page news section now shows:
1. **Local club news** (from your CMS)
2. **Rotary International news** (from RSS feed)

Both are combined, sorted by date, and limited to 6 items.

### Configuration

Edit RSS settings in `lib/utils/rss-parser.ts`:

```typescript
export const ROTARY_RSS_FEEDS: RSSFeedConfig[] = [
  {
    url: 'https://www.rotary.org/rss.xml',
    name: 'Rotary International News',
    enabled: true,
  },
];
```

### Caching
- RSS feed is cached for **1 hour** (3600 seconds)
- Prevents excessive external requests
- Updates automatically after cache expires

---

## 🧩 HOMEPAGE SECTIONS

### Default Order (When No DB Sections)

1. **Hero** — Large banner with CTAs
2. **Meeting Info** — Next meeting details
3. **Impact Stats** — Members, projects, service hours
4. **What is Rotary?** — Overview of Rotary's causes
5. **Upcoming Events** — Next 3 events
6. **Avenues of Service** — 6 pathways
7. **Featured Projects** — Showcase 3 projects
8. **Our Leadership** — Board preview (5 members)
9. **News & Updates** — Local + Rotary RSS (6 items)
10. **Get Involved** — Volunteer, Donate, Join cards
11. **Sponsor Club** — Sponsor acknowledgment
12. **CTA Banner** — Final call-to-action

### Admin-Customizable

Admins can:
- Reorder sections
- Toggle visibility
- Customize titles, subtitles, CTAs
- Add/remove sections

**Admin path**: Admin → Homepage Settings

---

## 🔧 AVAILABLE SCRIPTS

```bash
npm run dev          # Start development server (with Turbopack)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript check
npm run db:generate  # Generate Supabase types
npm run db:reset     # Reset local Supabase
npm run db:seed      # Seed local Supabase
```

---

## 🗂️ PROJECT STRUCTURE

```
rotaract/
├── app/
│   ├── (public)/          # Public website
│   │   ├── page.tsx       # Homepage (dynamic)
│   │   ├── about/         # About pages
│   │   ├── projects/      # Projects
│   │   ├── events/        # Events
│   │   ├── news/          # Blog/News
│   │   ├── join/          # Membership
│   │   └── ...            # Other pages
│   ├── (auth)/            # Login, signup
│   ├── (member)/          # Member portal
│   ├── (admin)/           # Admin dashboard
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # shadcn/ui primitives
│   ├── layout/            # Header, footer, logo
│   └── ...                # Feature components
├── lib/
│   ├── db/                # Supabase queries
│   ├── utils/             # Helpers (RSS parser, etc.)
│   └── constants/         # Brand colors, routes
├── supabase/
│   ├── migrations/        # SQL migrations
│   └── seed/              # Demo data
└── public/
    └── images/            # Static images
```

---

## 🌐 DEPLOYMENT

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Cron Jobs Setup

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

Or use external cron service to hit:
`https://your-domain.com/api/cron/reminders`
with header: `Authorization: Bearer $CRON_SECRET`

---

## ✅ WHAT'S BEEN UPDATED

### Recent Improvements

1. ✅ **Rotary RSS Feed Integration**
   - News section shows both local and Rotary International news
   - Automatic fallback if feed is unavailable
   - Cached for performance

2. ✅ **Rotary Logo Component**
   - Professional SVG Rotary wheel
   - Multiple variants (full, wheel, wordmark, club)
   - Custom logo URL support

3. ✅ **Enhanced Navigation**
   - Dropdown menus for About and Service sections
   - Better mobile menu with nested items
   - Rotary Quick Start Guide structure

4. ✅ **Improved Footer**
   - Organized link sections
   - Meeting information display
   - Contact details
   - Rotary International resources

5. ✅ **New Landing Page Sections**
   - "What is Rotary?" — Overview of Rotary's 7 areas of focus
   - "Get Involved" — Volunteer, Donate, Join CTAs
   - Better section ordering

6. ✅ **Enhanced News Section**
   - Combined local + RSS news
   - Source badges (Club News / Rotary International)
   - External link handling for RSS items
   - Better card design

---

## 🎯 NEXT STEPS

### Recommended Actions

1. **Add Real Content**
   - Go to Admin Dashboard
   - Add projects, events, news, members
   - Configure site settings

2. **Upload Images**
   - Download from Rotary Brand Center
   - Upload to Supabase Storage buckets
   - Link in admin forms

3. **Customize Homepage**
   - Admin → Homepage Settings
   - Reorder sections as needed
   - Customize titles, subtitles, CTAs

4. **Test Email System**
   - Fill out contact form
   - Submit membership inquiry
   - Register for event
   - Check email delivery

5. **Deploy to Production**
   - Follow Vercel deployment steps
   - Set up cron jobs
   - Test all features

---

## 📞 SUPPORT

For issues or questions:
- Check Supabase logs for database errors
- Check browser console for client errors
- Review `.env.local` values
- Verify Supabase RLS policies are enabled

---

## 📚 RESOURCES

- **Rotary Brand Center**: https://brandcenter.rotary.org
- **Rotary International**: https://www.rotary.org
- **Rotary RSS Feed**: https://www.rotary.org/rss.xml
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **shadcn/ui**: https://ui.shadcn.com

---

**Last Updated**: April 14, 2026
**Version**: 1.0.0
