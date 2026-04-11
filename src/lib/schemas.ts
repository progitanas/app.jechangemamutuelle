import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(2, "Prenom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.string().trim().toLowerCase().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caracteres"),
});

export const requestSchema = z
  .object({
    campaignName: z.string().min(3, "Nom de campagne requis"),
    needType: z.string().min(2),
    requestedLeads: z.coerce.number().int().min(1),
    age: z.coerce.number().int().min(18).max(100),
    situation: z.string().min(2),
    coverageLevel: z.string().min(2),
    geoArea: z.string().min(2),
    targetSegment: z.string().min(2),
    qualityLevel: z.string().min(2),
    isExclusive: z.boolean().default(false),
    startDate: z.string().optional().or(z.literal("")),
    campaignDurationDays: z.coerce.number().int().min(1).max(365),
    budget: z.coerce.number().int().min(20),
    maxPricePerLead: z.coerce.number().int().min(1),
    volumeCadence: z.enum(["DAY", "WEEK", "MONTH"]),
    volumePerCadence: z.coerce.number().int().min(1),
    targetAgeMin: z.coerce.number().int().min(18).max(100),
    targetAgeMax: z.coerce.number().int().min(18).max(100),
    familySituation: z.string().optional().or(z.literal("")),
    professionalStatus: z.string().optional().or(z.literal("")),
    incomeLevel: z.string().optional().or(z.literal("")),
    currentContractType: z.string().optional().or(z.literal("")),
    contractExpiryDate: z.string().optional().or(z.literal("")),
    immediateNeed: z.boolean().default(false),
    preferredContactChannel: z.string().optional().or(z.literal("")),
    phoneRequired: z.boolean().default(true),
    emailRequired: z.boolean().default(true),
    alreadyInsured: z.boolean().default(false),
    customerType: z.string().optional().or(z.literal("")),
    deliveryCadence: z.enum(["REAL_TIME", "DAILY_BATCH", "WEEKLY_BATCH"]),
    deliveryByEmail: z.boolean().default(false),
    deliveryByWebhook: z.boolean().default(false),
    deliveryByApi: z.boolean().default(false),
    deliveryByCsv: z.boolean().default(false),
    deliveryToCrm: z.boolean().default(false),
    instantNotifications: z.boolean().default(true),
    autoPauseOnQuota: z.boolean().default(true),
    deliveryHours: z.string().optional().or(z.literal("")),
    quotaRequested: z.coerce.number().int().min(1),
    dailyLimit: z.coerce.number().int().min(1).optional(),
    monthlyLimit: z.coerce.number().int().min(1).optional(),
    autoStopAtQuota: z.boolean().default(true),
    autoResumeOnRecharge: z.boolean().default(false),
    rolloverUnusedQuota: z.boolean().default(false),
    isTemplate: z.boolean().default(false),
    templateName: z.string().optional().or(z.literal("")),
    isRecurring: z.boolean().default(false),
    recurrenceCadence: z.enum(["NONE", "WEEKLY", "MONTHLY"]),
    notes: z.string().max(500).optional().or(z.literal("")),
  })
  .refine((data) => data.targetAgeMax >= data.targetAgeMin, {
    message: "L'age max doit etre superieur ou egal a l'age min",
    path: ["targetAgeMax"],
  })
  .refine(
    (data) =>
      data.deliveryByEmail ||
      data.deliveryByWebhook ||
      data.deliveryByApi ||
      data.deliveryByCsv ||
      data.deliveryToCrm,
    {
      message: "Selectionnez au moins un mode de livraison",
      path: ["deliveryByEmail"],
    },
  )
  .refine((data) => data.quotaRequested >= data.requestedLeads, {
    message: "Le quota demande doit etre >= au volume souhaite",
    path: ["quotaRequested"],
  });

export const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(8, "Mot de passe actuel requis"),
    newPassword: z.string().min(10, "Minimum 10 caracteres"),
    confirmPassword: z.string().min(10, "Confirmation requise"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "La confirmation ne correspond pas",
    path: ["confirmPassword"],
  });

export const partnerCreateSchema = z.object({
  name: z.string().min(2, "Nom partenaire requis"),
  email: z.email("Email partenaire invalide"),
  phone: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  deliveryWebhookUrl: z.url("Webhook invalide").optional().or(z.literal("")),
  apiEndpoint: z.url("API endpoint invalide").optional().or(z.literal("")),
  apiKey: z.string().optional().or(z.literal("")),
  csvEmail: z.email("Email CSV invalide").optional().or(z.literal("")),
  crmWebhookUrl: z.url("CRM webhook invalide").optional().or(z.literal("")),
});

export const partnerImportSchema = z.object({
  rows: z.string().min(3, "Contenu d'import requis"),
});

export const leadSendSchema = z.object({
  leadId: z.string().min(8),
  partnerId: z.string().min(8),
  channel: z.enum(["EMAIL", "CSV_EXPORT", "API", "MANUAL"]),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export const leadRejectSchema = z.object({
  leadId: z.string().min(8),
  reason: z.enum([
    "HORS_CIBLE",
    "NUMERO_INJOIGNABLE",
    "EMAIL_INVALIDE",
    "DOUBLON",
    "BUDGET_INCOMPATIBLE",
    "DELAI_DEPASSE",
    "AUTRE",
  ]),
  details: z.string().max(500).optional().or(z.literal("")),
});

export const leadDisputeReviewSchema = z.object({
  disputeId: z.string().min(8),
  decision: z.enum(["ACCEPT", "REJECT"]),
  resolutionComment: z.string().max(500).optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RequestInput = z.infer<typeof requestSchema>;
export type RequestFormInput = z.input<typeof requestSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type PartnerCreateInput = z.infer<typeof partnerCreateSchema>;
export type PartnerImportInput = z.infer<typeof partnerImportSchema>;
export type LeadSendInput = z.infer<typeof leadSendSchema>;
export type LeadRejectInput = z.infer<typeof leadRejectSchema>;
export type LeadDisputeReviewInput = z.infer<typeof leadDisputeReviewSchema>;
