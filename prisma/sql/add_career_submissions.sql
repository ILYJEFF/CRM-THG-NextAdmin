-- CRM: career site fields on job orders + candidate–job submissions
-- Run after clients module, or use: npx prisma db push

ALTER TABLE "crm_job_orders" ADD COLUMN IF NOT EXISTS "publicDescription" TEXT;
ALTER TABLE "crm_job_orders" ADD COLUMN IF NOT EXISTS "publicLocation" TEXT;
ALTER TABLE "crm_job_orders" ADD COLUMN IF NOT EXISTS "publicEmploymentType" TEXT DEFAULT 'FULL_TIME';
ALTER TABLE "crm_job_orders" ADD COLUMN IF NOT EXISTS "publicCompanyName" TEXT;
ALTER TABLE "crm_job_orders" ADD COLUMN IF NOT EXISTS "careerPostingId" TEXT;
ALTER TABLE "crm_job_orders" ADD COLUMN IF NOT EXISTS "careerSlug" TEXT;
ALTER TABLE "crm_job_orders" ADD COLUMN IF NOT EXISTS "careerPublishedAt" TIMESTAMP(3);
ALTER TABLE "crm_job_orders" ADD COLUMN IF NOT EXISTS "careerLastSyncAt" TIMESTAMP(3);
ALTER TABLE "crm_job_orders" ADD COLUMN IF NOT EXISTS "careerLastError" TEXT;
ALTER TABLE "crm_job_orders" ADD COLUMN IF NOT EXISTS "responsibilities" TEXT;
ALTER TABLE "crm_job_orders" ADD COLUMN IF NOT EXISTS "requirements" TEXT;
ALTER TABLE "crm_job_orders" ADD COLUMN IF NOT EXISTS "salaryMin" INTEGER;
ALTER TABLE "crm_job_orders" ADD COLUMN IF NOT EXISTS "salaryMax" INTEGER;
ALTER TABLE "crm_job_orders" ADD COLUMN IF NOT EXISTS "salaryPeriod" TEXT;

CREATE TABLE IF NOT EXISTS "crm_submissions" (
  "id" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "jobOrderId" TEXT NOT NULL,
  "stage" TEXT NOT NULL DEFAULT 'triage',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "crm_submissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "crm_submissions_candidateId_jobOrderId_key"
  ON "crm_submissions"("candidateId", "jobOrderId");
CREATE INDEX IF NOT EXISTS "crm_submissions_jobOrderId_idx" ON "crm_submissions"("jobOrderId");
CREATE INDEX IF NOT EXISTS "crm_submissions_candidateId_idx" ON "crm_submissions"("candidateId");

ALTER TABLE "crm_submissions" DROP CONSTRAINT IF EXISTS "crm_submissions_candidateId_fkey";
ALTER TABLE "crm_submissions" ADD CONSTRAINT "crm_submissions_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "crm_candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "crm_submissions" DROP CONSTRAINT IF EXISTS "crm_submissions_jobOrderId_fkey";
ALTER TABLE "crm_submissions" ADD CONSTRAINT "crm_submissions_jobOrderId_fkey"
  FOREIGN KEY ("jobOrderId") REFERENCES "crm_job_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
