-- Run in Supabase SQL Editor if crm_candidates already exists without notes
ALTER TABLE "crm_candidates" ADD COLUMN IF NOT EXISTS "notes" TEXT;
