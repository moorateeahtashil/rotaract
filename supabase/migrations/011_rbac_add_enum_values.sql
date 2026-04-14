-- ============================================================
-- ROTARACT PLATFORM — Migration 011
-- Step 1: Add new enum values ONLY.
-- Must be committed before migration 012 uses them.
-- PostgreSQL cannot use a newly added enum value in the same
-- transaction that added it (SQLSTATE 55P04).
-- ============================================================

ALTER TYPE user_role_type ADD VALUE IF NOT EXISTS 'normal';
ALTER TYPE user_role_type ADD VALUE IF NOT EXISTS 'prospective_member';
