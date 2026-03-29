-- Run in Supabase SQL Editor (CRM database) if crm_contacts exists without jobDescriptionUrl.
ALTER TABLE "crm_contacts" ADD COLUMN IF NOT EXISTS "jobDescriptionUrl" TEXT;
