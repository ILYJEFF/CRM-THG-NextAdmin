-- CreateTable
CREATE TABLE "crm_agreed_to_marketing" (
    "id" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyName" TEXT,
    "jobTitle" TEXT,
    "city" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_agreed_to_marketing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "crm_agreed_to_marketing_email_idx" ON "crm_agreed_to_marketing"("email");

-- CreateIndex
CREATE INDEX "crm_agreed_to_marketing_createdAt_idx" ON "crm_agreed_to_marketing"("createdAt");
