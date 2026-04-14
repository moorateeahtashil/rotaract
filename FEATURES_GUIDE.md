# 🎯 Admin Dashboard & Features Guide

## 1. How to Access Admin Dashboard

### Step 1: Create Your Account
1. Start the dev server: `npm run dev`
2. Go to: **http://localhost:3001/signup**
3. Fill in your details and create an account

### Step 2: Grant Admin Role
After signing up, you need admin privileges:

1. Open your **Supabase Dashboard** → **SQL Editor**
2. Run this query (replace with your user ID):

```sql
-- Find your user ID first
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Then grant the super_admin role
INSERT INTO user_roles (user_id, role, is_active)
VALUES ('YOUR-USER-ID-HERE', 'super_admin', true);
```

### Step 3: Access Admin Dashboard
- URL: **http://localhost:3001/admin**
- You'll see the admin sidebar with all management options

### Role Levels

| Role | Access Level |
|------|-------------|
| `super_admin` | Full access to everything |
| `admin` | Full access |
| `president` | All content management |
| `secretary` | Content + communications |
| `event_manager` | Events & bookings only |
| `membership_director` | Members & applications |
| `member` | Member portal only |

---

## 2. What's Been Added

### ✅ News Page Fixed
- **Issue**: `/news` was showing empty
- **Fix**: 
  1. Fixed Next.js 15 `searchParams` Promise issue
  2. Created seed data SQL with 6 sample posts
  3. Integrated Rotary RSS feed (English-only filter)

**Run seed data after migrations:**
```bash
# In Supabase SQL Editor, run:
supabase/seed/002_seed_sample_data.sql
```

### ✅ News in English
- Rotary RSS feed now filters for English-language items only
- All sample posts are in English

### ✅ Rotary History Page
- **URL**: `/about/rotary`
- **Content**:
  - 120+ year timeline (1905-2025)
  - Seven Areas of Focus
  - The Rotary Foundation overview
  - Four-Way Test
  - "Service Above Self" motto section

### ✅ Modern "What is Rotary?" Section
- **Location**: Homepage
- **Design**:
  - Gradient background with blur effects
  - 8 animated cards with stats
  - Links to Rotary History page and Rotary.org
  - Mobile-responsive layout

### ✅ Prospective Member Type
- New user type for people interested in joining
- Can sign up, view events/announcements
- Limited member portal access
- Tracked in `prospective_members` table

### ✅ QR Code Attendance System

#### For Admins (Generate QR)
1. Go to **Admin → Events → [Select Event] → Generate QR Code**
2. Set expiry time (default 24 hours)
3. Display the QR code at the event or share the token

#### For Members (Scan & Mark Attendance)
1. Go to **Member Portal → Attendance Scanner** (`/member/attendance`)
2. Enter the QR code token manually
3. Attendance is marked instantly

#### How It Works
```
Admin generates QR → Member scans/enters token → Attendance recorded → Admin views records
```

**Tables involved:**
- `event_qr_codes` — QR tokens for events
- `attendance_scan_logs` — Scan history
- `attendance_records` — Official attendance records

---

## 3. Database Setup Order

Run migrations in this order:

```bash
# 1. Core schema (enums, tables, functions, triggers, RLS)
supabase/migrations/001_initial_schema.sql

# 2. Additional tables (projects, events, posts, media, email, etc.)
supabase/migrations/002_additional_tables.sql

# 3. QR attendance system
supabase/migrations/003_qr_attendance.sql

# 4. Prospective member support
supabase/migrations/004_prospective_members.sql

# 5. Seed sample data (optional but recommended)
supabase/seed/002_seed_sample_data.sql
```

---

## 4. New Pages & Routes

### Public Pages
| Route | Description |
|-------|------------|
| `/about/rotary` | Rotary International history & legacy |
| `/news` | News & Updates (fixed + RSS feed) |

### Member Portal
| Route | Description |
|-------|------------|
| `/member/attendance` | QR code scanner for event attendance |

### Admin Pages
| Route | Description |
|-------|------------|
| `/admin/events/[id]/qr` | Generate QR codes for events |

### API Routes
| Route | Method | Description |
|-------|--------|------------|
| `/api/attendance/scan` | POST | Mark member attendance via QR token |
| `/api/admin/qr/generate` | POST | Generate new QR code for event |

---

## 5. How to Populate News

### Option A: Via Admin Dashboard
1. Login to `/admin`
2. Go to **Admin → News/Blog**
3. Click **Create Post**
4. Fill in title, content, category, publish

### Option B: Via Seed Data
Run the seed SQL file in Supabase SQL Editor:
```
supabase/seed/002_seed_sample_data.sql
```

This adds 6 sample posts across different categories.

---

## 6. QR Code Attendance Flow

### Step-by-Step Setup

#### Before Event
1. Admin creates/edits an event
2. Goes to **Admin → Events → [Event] → QR Code**
3. Sets expiry time (e.g., 24 hours for same-day event)
4. Generates QR code
5. Displays at venue entrance or shares with attendees

#### During Event
1. Members go to `/member/attendance`
2. Enter the token shown below the QR code
3. Click "Mark Attendance"
4. Confirmation appears instantly

#### After Event
1. Admin views attendance at **Admin → Events → [Event] → Attendance**
2. Exports or analyzes participation data

---

## 7. Prospective Member Flow

### Sign Up
1. User visits `/join` or `/signup`
2. Creates account (gets `applicant` or `prospective` role)
3. Can browse events, announcements
4. Cannot access full member features

### Conversion to Member
1. Admin reviews application in **Admin → Members → Applications**
2. Interviews (optional)
3. Approves application
4. Creates full member record
5. User gets `member` role with full access

---

## 8. Testing Everything

### Test Checklist

- [ ] Run all 4 migrations
- [ ] Run seed data
- [ ] Create admin user
- [ ] Visit `/news` — should show 6 posts
- [ ] Visit `/about/rotary` — should show timeline
- [ ] Check homepage — "What is Rotary?" should have modern gradient design
- [ ] Create an event in admin
- [ ] Generate QR code for event
- [ ] Create member account
- [ ] Test attendance scanner with token
- [ ] Check attendance records in admin

---

## 9. Common Issues

### News page still empty?
- Ensure seed data SQL was run
- Check Supabase logs for errors
- Verify `posts` table has records with `is_published = true`

### Can't access `/admin`?
- Ensure your user has a role in `user_roles` table
- Role must be `super_admin`, `admin`, or other admin-level role
- Check `is_active = true` in `user_roles`

### QR code not working?
- Run migration `003_qr_attendance.sql`
- Check `event_qr_codes` table for generated tokens
- Ensure member is logged in when scanning

### Prospective member can't sign up?
- Run migration `004_prospective_members.sql`
- Check `prospective_members` table exists
- Verify RLS policies are active

---

## 10. Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run start                  # Production server

# Database
npx supabase db push           # Push all migrations
npx supabase db reset          # Reset local DB
npx supabase gen types typescript --project-id YOUR-ID --schema public > lib/db/types.ts

# Other
npm run lint                   # ESLint
npm run typecheck              # TypeScript check
```

---

**Last Updated**: April 14, 2026
