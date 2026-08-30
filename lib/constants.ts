import type {
  AchievementCategory,
  AnnouncementPriority,
  InventoryCategory,
  InventoryCondition,
  CivilStatus,
  ComplaintCategory,
  ComplaintStatus,
  DocumentType,
  Gender,
  HouseholdRelation,
  RequestStatus,
  LifeStatus,
  ResidencyStatus,
  Role,
  VerificationStatus,
} from "@prisma/client";

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  BARANGAY_CLEARANCE: "Barangay Clearance",
  CERTIFICATE_OF_RESIDENCY: "Certificate of Residency",
  CERTIFICATE_OF_INDIGENCY: "Certificate of Indigency",
  BUSINESS_CLEARANCE: "Business Clearance",
};

export const DOCUMENT_PREFIX: Record<DocumentType, string> = {
  BARANGAY_CLEARANCE: "BC",
  CERTIFICATE_OF_RESIDENCY: "CR",
  CERTIFICATE_OF_INDIGENCY: "CI",
  BUSINESS_CLEARANCE: "BB",
};

export const ROLE_HOME: Record<Role, string> = {
  RESIDENT: "/portal",
  STAFF: "/staff/dashboard",
  ADMIN: "/staff/dashboard",
};

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: "Male",
  FEMALE: "Female",
};

export const CIVIL_STATUS_LABELS: Record<CivilStatus, string> = {
  SINGLE: "Single",
  MARRIED: "Married",
  WIDOWED: "Widowed",
  SEPARATED: "Separated",
};

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  UNVERIFIED: "Unverified",
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: "Pending",
  REVIEWING: "Reviewing",
  APPROVED: "Approved",
  RELEASED: "Released",
  REJECTED: "Rejected",
};

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  NEW: "New",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

export const COMPLAINT_CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  NOISE: "Noise",
  WASTE: "Waste / garbage",
  STREETLIGHT: "Streetlight",
  DISTURBANCE: "Disturbance",
  INFRASTRUCTURE: "Infrastructure",
  OTHER: "Other",
};

export const RELATION_LABELS: Record<HouseholdRelation, string> = {
  MEMBER: "Registered member",
  BOARDER: "Boarder / nakikitira",
};

export const RESIDENCY_LABELS: Record<ResidencyStatus, string> = {
  ACTIVE: "Living here",
  MOVED_OUT: "Moved out",
};

export const LIFE_STATUS_LABELS: Record<LifeStatus, string> = {
  ALIVE: "Living",
  DECEASED: "Deceased",
};

export const PRIORITY_LABELS: Record<AnnouncementPriority, string> = {
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

export const ACHIEVEMENT_LABELS: Record<AchievementCategory, string> = {
  AWARD: "Award",
  CERTIFICATE: "Certificate",
  RECOGNITION: "Recognition",
  SEAL: "Seal / accreditation",
  OTHER: "Other",
};

export const INVENTORY_CATEGORY_LABELS: Record<InventoryCategory, string> = {
  FURNITURE: "Furniture",
  EVENT: "Event / tents",
  AUDIO_VISUAL: "Sound / lights",
  VEHICLE: "Vehicle",
  COMMUNICATION: "Radio / comms",
  DISASTER: "Disaster / rescue",
  SPORTS: "Sports",
  OFFICE: "Office",
  OTHER: "Other",
};

export const BUDGET_CATEGORY_LABELS: Record<string, string> = {
  PERSONAL_SERVICES: "Personal services",
  MOOE: "MOOE",
  CAPITAL_OUTLAY: "Capital outlay",
  SK_FUND: "SK fund",
  GAD: "GAD",
  CALAMITY: "Calamity / DRRM",
  DEVELOPMENT: "Development",
  PEACE_AND_ORDER: "Peace and order",
  HEALTH: "Health",
  OTHER: "Other",
};

export const OFFICIAL_ROLE_LABELS: Record<string, string> = {
  PUNONG_BARANGAY: "Punong Barangay",
  BARANGAY_KAGAWAD: "Barangay Kagawad",
  SECRETARY: "Barangay Secretary",
  TREASURER: "Barangay Treasurer",
  SK_CHAIRPERSON: "SK Chairperson",
  SK_KAGAWAD: "SK Kagawad",
  TANOD: "Barangay Tanod",
  HEALTH_WORKER: "Barangay Health Worker",
  OTHER: "Other",
};

export const OFFICIAL_ROLE_ORDER: Record<string, number> = {
  PUNONG_BARANGAY: 10,
  SECRETARY: 20,
  TREASURER: 30,
  BARANGAY_KAGAWAD: 40,
  SK_CHAIRPERSON: 50,
  SK_KAGAWAD: 60,
  TANOD: 70,
  HEALTH_WORKER: 80,
  OTHER: 90,
};

export const INVENTORY_CONDITION_LABELS: Record<InventoryCondition, string> = {
  GOOD: "Good",
  FAIR: "Fair",
  NEEDS_REPAIR: "Needs repair",
  UNUSABLE: "Unusable",
};

export function formatResidentName(r: {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  suffix?: string | null;
}) {
  const middle = r.middleName ? ` ${r.middleName}` : "";
  const suffix = r.suffix ? ` ${r.suffix}` : "";
  return `${r.firstName}${middle} ${r.lastName}${suffix}`;
}

export function pesos(amount: { toString(): string } | number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(amount));
}
