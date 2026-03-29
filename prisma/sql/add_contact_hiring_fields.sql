-- Optional: run in SQL editor if you prefer raw SQL over `npx prisma db push`
ALTER TABLE "crm_contacts" ADD COLUMN IF NOT EXISTS "openPositions" TEXT;
ALTER TABLE "crm_contacts" ADD COLUMN IF NOT EXISTS "payBand" TEXT;
