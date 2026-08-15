export const LEAD_STATUSES = [
  "Prepared",
  "Verified-Sent",
  "Skipped-Role mismatch",
  "Skipped-Duplicate",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const SAFETY_RULES = [
  "No Aadhaar, PAN, bank, salary, gender, native-place, password, or OTP data.",
  "No attachments or sensitive documents in outreach.",
  "No email, form submission, account creation, or external action without Confirm & Send.",
  "Only public vacancy and public contact evidence may be used.",
] as const;

export const CANDIDATE_PROFILE = {
  owner: "Balaji Rajput",
  targetRoles: ["QA", "IPQA", "QMS", "OSD", "Pharmaceutical Quality"],
  experience: "Approximately 2 years of pharmaceutical QA/IPQA experience",
  education: "Diploma in Biotechnology",
  availability: "Immediate joiner",
};

export type IngestedLead = {
  employer: string;
  roleTitle: string;
  location?: string;
  postingDate?: string;
  sourceUrl: string;
  publicContactEmail?: string;
  publicContactEvidence?: string;
  vacancyText: string;
  status?: LeadStatus;
  roleFit?: string;
  eligibilityNotes?: string;
  draftSubject?: string;
  draftBody?: string;
};
