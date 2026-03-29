-- CRM database: clients, job orders, contracts, and contact.clientId
-- Run in Supabase SQL editor if you prefer SQL over `npx prisma db push`.

CREATE TABLE IF NOT EXISTS "crm_clients" (
  "id" TEXT NOT NULL,
  "companyName" TEXT,
  "contactName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "industry" TEXT,
  "internalNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "crm_clients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_job_orders" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "roleSummary" TEXT,
  "status" TEXT NOT NULL DEFAULT 'open',
  "priority" TEXT NOT NULL DEFAULT 'normal',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "crm_job_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_client_contracts" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "label" TEXT,
  "fileUrl" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "crm_client_contracts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "crm_job_orders_clientId_idx" ON "crm_job_orders"("clientId");
CREATE INDEX IF NOT EXISTS "crm_client_contracts_clientId_idx" ON "crm_client_contracts"("clientId");

ALTER TABLE "crm_contacts" ADD COLUMN IF NOT EXISTS "clientId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "crm_contacts_clientId_key" ON "crm_contacts"("clientId") WHERE "clientId" IS NOT NULL;

ALTER TABLE "crm_job_orders" DROP CONSTRAINT IF EXISTS "crm_job_orders_clientId_fkey";
ALTER TABLE "crm_job_orders" ADD CONSTRAINT "crm_job_orders_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "crm_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "crm_client_contracts" DROP CONSTRAINT IF EXISTS "crm_client_contracts_clientId_fkey";
ALTER TABLE "crm_client_contracts" ADD CONSTRAINT "crm_client_contracts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "crm_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "crm_contacts" DROP CONSTRAINT IF EXISTS "crm_contacts_clientId_fkey";
ALTER TABLE "crm_contacts" ADD CONSTRAINT "crm_contacts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "crm_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
