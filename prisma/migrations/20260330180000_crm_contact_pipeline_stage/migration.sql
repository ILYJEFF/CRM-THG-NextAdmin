-- Lead pipeline from marketing site ingest (inbox, contacted, etc.)
ALTER TABLE "crm_contacts" ADD COLUMN IF NOT EXISTS "pipelineStage" TEXT NOT NULL DEFAULT 'inbox';
