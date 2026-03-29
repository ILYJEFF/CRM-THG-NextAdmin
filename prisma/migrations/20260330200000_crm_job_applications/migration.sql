CREATE TABLE "crm_job_applications" (
    "id" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "jobTitle" TEXT,
    "jobCompanyName" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "currentLocation" TEXT,
    "coverLetter" TEXT,
    "resumeUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_job_applications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "crm_job_applications_jobPostingId_idx" ON "crm_job_applications"("jobPostingId");
CREATE INDEX "crm_job_applications_status_idx" ON "crm_job_applications"("status");
CREATE INDEX "crm_job_applications_createdAt_idx" ON "crm_job_applications"("createdAt");
