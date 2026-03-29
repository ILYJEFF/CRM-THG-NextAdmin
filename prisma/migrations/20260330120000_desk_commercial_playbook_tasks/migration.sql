-- Desk module: client commercial fields, playbook CMS, account tasks.
-- Safe to re-run: uses IF NOT EXISTS where supported.

CREATE TABLE IF NOT EXISTS "crm_playbook_sections" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "eyebrow" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "crm_playbook_sections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "crm_playbook_sections_slug_key" ON "crm_playbook_sections"("slug");

CREATE INDEX IF NOT EXISTS "crm_playbook_sections_sortOrder_idx" ON "crm_playbook_sections"("sortOrder");

CREATE TABLE IF NOT EXISTS "crm_account_tasks" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "crm_account_tasks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "crm_account_tasks_clientId_idx" ON "crm_account_tasks"("clientId");

CREATE INDEX IF NOT EXISTS "crm_account_tasks_clientId_completedAt_idx" ON "crm_account_tasks"("clientId", "completedAt");

DO $$ BEGIN
  ALTER TABLE "crm_account_tasks" ADD CONSTRAINT "crm_account_tasks_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "crm_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "crm_clients" ADD COLUMN IF NOT EXISTS "engagementType" TEXT;
ALTER TABLE "crm_clients" ADD COLUMN IF NOT EXISTS "feeSummary" TEXT;
ALTER TABLE "crm_clients" ADD COLUMN IF NOT EXISTS "warrantySummary" TEXT;
ALTER TABLE "crm_clients" ADD COLUMN IF NOT EXISTS "commercialNotes" TEXT;
ALTER TABLE "crm_clients" ADD COLUMN IF NOT EXISTS "agreementRenewalAt" TIMESTAMP(3);
ALTER TABLE "crm_clients" ADD COLUMN IF NOT EXISTS "nextReviewAt" TIMESTAMP(3);
ALTER TABLE "crm_clients" ADD COLUMN IF NOT EXISTS "lastReviewAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "crm_clients_nextReviewAt_idx" ON "crm_clients"("nextReviewAt");
