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

## Role System (Restructured — April 2026, Migration 011)
Two-dimensional RBAC:

System Roles (Dashboard Access):
- super_admin (0): DB-level only. Ultimate access.
- admin (1): Access Admin Dashboard.

Org Roles (Membership Status):
- board_member (2): Elevated privileges, internal members section, content creation.
- member (3): Standard approved member.
- prospective_member (4): Pending/trial member. No member portal access.
- normal (5): Standard system role. No special access.

Legacy roles kept in DB (treated as board_member level): president, secretary, public_image_director, membership_director, project_director, event_manager, applicant.

Access Rules:
- Admin Dashboard: roles IN ('super_admin', 'admin') only
- Member Portal: roles IN ('super_admin', 'admin', 'board_member', 'member', + legacy board roles)
- Pending: prospective_member, normal, no roles

## Key Auth Files
- Guards: lib/auth/guards.ts — requireAdmin(), requireMember(), requireBoardMember()
- Session: lib/auth/session.ts — ADMIN_ROLES, BOARD_ROLES, MEMBER_ROLES, canAccessAdmin(), canAccessMemberPortal(), hasBoardPrivileges()
- Middleware: middleware.ts (uses ADMIN_SYSTEM_ROLES / MEMBER_ACCESS_ROLES arrays)
- Admin sidebar: components/admin/admin-sidebar.tsx

## Signup/Approval Flow
1. User signs up → gets prospective_member role (via DB trigger in migration 011)
2. Prospective members see /pending page (middleware redirects them there)
3. Admin approves via /admin/members → deactivates prospective_member → grants member role
4. Admin can invite users via /api/admin/users/invite

## Admin Dashboard — Key Changes
- Removed: Navigation management, Pages management sections from sidebar
- Added: Committees management (/admin/committees)
- Updated: Legal Pages uses TipTap WYSIWYG editor (HTML storage, not Markdown)
- Expanded: Site Settings has tabs: General, Branding, Footer, Social Media, Contact

## Profile Fields (Updated)
profiles table now has: year_of_service, profile_complete, short_bio (migration 011)
Profile form shows: name, email, phone, year_of_service, classification (read-only), occupation, company, short_bio, bio, address fields, committee memberships (read-only), social links

## Committees
- Admin page: /admin/committees (full CRUD)
- DB: committees table with chair_member_id (board member), wallet_address (new in 011)
- committee_members table for member-committee many-to-many

## People / Board Members
- Public all-members page: /members (with tab nav to /leadership)
- Public board members page: /leadership (Board Members view)
- Both pages share tab navigation between "All Members" and "Board Members"

## Rich Text Editor
- TipTap already installed (@tiptap/react, @tiptap/starter-kit, etc.)
- Reusable component: components/ui/rich-text-editor.tsx
- Used in: Legal Pages editor (/admin/content)
- Terms/Privacy front-end: detects HTML vs legacy Markdown, renders accordingly

## DB Migrations Applied
001 → 011 (latest). Run: supabase db push or apply migrations in Supabase Dashboard SQL Editor.
