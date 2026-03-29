import { z } from "zod";

const isoDateString = z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
  message: "Invalid ISO date",
});

export const contactIngestSchema = z.object({
  id: z.string().min(1),
  companyName: z.string().nullable().optional(),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  city: z.string().min(1),
  industry: z.string().nullable().optional(),
  openPositions: z.string().nullable().optional(),
  payBand: z.string().nullable().optional(),
  message: z.string().min(1),
  jobDescriptionUrl: z.string().nullable().optional(),
  pipelineStage: z.string().min(1).optional(),
  status: z.string().min(1),
  notes: z.string().nullable().optional(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

export const candidateIngestSchema = z.object({
  id: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  currentLocation: z.string().min(1),
  desiredLocation: z.string().min(1),
  industry: z.string().min(1),
  positionType: z.string().min(1),
  resumeUrl: z.string().nullable().optional(),
  coverLetter: z.string().nullable().optional(),
  status: z.string().min(1),
  notes: z.string().nullable().optional(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

export const jobApplicationIngestSchema = z.object({
  id: z.string().min(1),
  jobPostingId: z.string().min(1),
  jobTitle: z.string().nullable().optional(),
  jobCompanyName: z.string().nullable().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  currentLocation: z.string().nullable().optional(),
  coverLetter: z.string().nullable().optional(),
  resumeUrl: z.string().min(1),
  status: z.string().min(1),
  notes: z.string().nullable().optional(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

export type ContactIngest = z.infer<typeof contactIngestSchema>;
export type CandidateIngest = z.infer<typeof candidateIngestSchema>;
export type JobApplicationIngest = z.infer<typeof jobApplicationIngestSchema>;
