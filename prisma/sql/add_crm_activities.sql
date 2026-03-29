-- CRM activity log (touch history on leads, clients, candidates)
CREATE TABLE IF NOT EXISTS "crm_activities" (
  "id" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "activityType" TEXT NOT NULL DEFAULT 'note',
  "body" TEXT NOT NULL,
  "actorEmail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "crm_activities_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "crm_activities_entityType_entityId_idx"
  ON "crm_activities"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "crm_activities_createdAt_idx"
  ON "crm_activities"("createdAt");
