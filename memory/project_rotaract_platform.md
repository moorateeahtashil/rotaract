---
name: Rotaract Platform Project State
description: Key details about the Rotaract club management platform architecture, fixes applied, and ongoing work
type: project
---

Full-stack Rotaract club management platform: Next.js 15, React 19, Supabase, Tailwind CSS, shadcn/ui.

## Architecture
- App Router with Server Components + "use client" boundaries
- Auth: Supabase Auth + user_roles table + middleware for route protection
- Key URL groups: `(public)`, `(auth)`, `member/`, `admin/`, `(admin)/`

## Role Hierarchy (lower = more privilege)
super_admin(0) > admin(1) > president(2) > secretary(3) > public_image_director(4) > membership_director(5) > project_director(6) > event_manager(7) > board_member(8) > member(9) > applicant(10) > public(11)

## Signup/Approval Flow
1. User signs up → gets `applicant` role (via DB trigger in migration 006)
2. Applicants see `/member/pending` page (middleware redirects them there)
3. Admin/super_admin approves via `/admin/members` → upgrades to `member` role
4. Admin can also invite users via `/api/admin/users/invite` (uses service role)

## Dashboard Routing
- Admin/board roles → `/admin`
- Members → `/member`
- Applicants/public → `/member/pending`
- Login page checks role after auth and redirects accordingly

## Key Fixes Applied (April 2026)
- Fixed Globe import missing in about/our-club/page.tsx
- Fixed recharts "Event handlers" error: moved charts to AdminCharts client component
- Fixed createServerClient() missing await in profile, announcements, bookings, directory, resources pages
- Fixed guard.redirect → guard.redirectTo (renamed property in guards.ts)
- Fixed QR generate API (broken imports: createServiceClient → createServiceRoleClient)
- Fixed attendance scan API (broken import: createClient → createServerClient)
- Added role-based redirect in middleware and login page
- Terms/Privacy now DB-backed (admin-editable via /admin/content)
- Profile page converted to client form (profile-form.tsx)
- Migration 006: event_types table + membership_applications + applicant role trigger

## Important File Locations
- Guards: lib/auth/guards.ts (returns { redirectTo } on failure, { session, userId, roles, highestRole } on success)
- Middleware: middleware.ts (handles route protection + role-based redirects)
- Member layout: app/member/layout.tsx (uses MemberShell component with role info)
- Admin charts: components/admin/admin-charts.tsx ("use client" wrapper for recharts)
- Member shell: components/layout/member-shell.tsx (sidebar + header with role badge)

## Why: Compliance/UX
- Terms/Privacy should follow Rotary International branding guidelines
- Rotary brand colors: Blue (#17458f), Gold (#f7a81b), Azure (#0066cc)
