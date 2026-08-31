import { z } from "zod";
import { voterAgeErrors } from "@/lib/age";

const passwordRules = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[0-9]/, "Include a number");

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[0-9]/, "Include a number"),
  firstName: z.string().min(1, "Required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Required"),
  suffix: z.string().optional(),
  birthdate: z.string().min(1, "Required"),
  gender: z.enum(["MALE", "FEMALE"]),
  civilStatus: z.enum(["SINGLE", "MARRIED", "WIDOWED", "SEPARATED"]),
  contactNumber: z.string().min(7, "Enter a contact number"),
  householdNumber: z.string().optional(),
  purok: z.string().min(1, "Required"),
  streetAddress: z.string().min(1, "Required"),
  relation: z.enum(["MEMBER", "BOARDER"]).optional(),
  isSenior: z.boolean().optional(),
  isPwd: z.boolean().optional(),
  isSoloParent: z.boolean().optional(),
  isRegisteredVoter: z.boolean().optional(),
  isSkVoter: z.boolean().optional(),
  privacyConsent: z
    .boolean()
    .refine((v) => v, "You must accept the privacy notice"),
}).superRefine((data, ctx) => {
  for (const message of voterAgeErrors(data.birthdate, data)) {
    ctx.addIssue({ code: "custom", path: ["isSkVoter"], message });
  }
});

export const residentSchema = z.object({
  firstName: z.string().min(1),
  middleName: z.string().optional(),
  lastName: z.string().min(1),
  suffix: z.string().optional(),
  birthdate: z.string().min(1),
  gender: z.enum(["MALE", "FEMALE"]),
  civilStatus: z.enum(["SINGLE", "MARRIED", "WIDOWED", "SEPARATED"]),
  contactNumber: z.string().optional(),
  householdId: z.string().min(1),
  isSenior: z.boolean().optional(),
  isPwd: z.boolean().optional(),
  isSoloParent: z.boolean().optional(),
  isRegisteredVoter: z.boolean().optional(),
  isSkVoter: z.boolean().optional(),
  remarks: z.string().optional(),
  relation: z.enum(["MEMBER", "BOARDER"]).optional(),
  email: z.string().optional(),
  password: z.string().optional(),
}).superRefine((data, ctx) => {
  for (const message of voterAgeErrors(data.birthdate, data)) {
    ctx.addIssue({ code: "custom", path: ["isSkVoter"], message });
  }
  const email = data.email?.trim();
  const password = data.password?.trim();
  if (!email && !password) return;
  if (!email) {
    ctx.addIssue({
      code: "custom",
      path: ["email"],
      message: "Email is required to create a portal login.",
    });
  } else if (!z.email().safeParse(email).success) {
    ctx.addIssue({
      code: "custom",
      path: ["email"],
      message: "Enter a valid email",
    });
  }
  if (!password) {
    ctx.addIssue({
      code: "custom",
      path: ["password"],
      message: "Temporary password is required with the email.",
    });
  } else {
    const pwd = passwordRules.safeParse(password);
    if (!pwd.success) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: pwd.error.issues[0]?.message ?? "Password is too weak",
      });
    }
  }
});

export const householdSchema = z.object({
  householdNumber: z.string().min(1),
  purok: z.string().min(1),
  streetAddress: z.string().min(1),
  headResidentId: z.string().optional(),
});

export const documentRequestSchema = z
  .object({
    type: z.enum([
      "BARANGAY_CLEARANCE",
      "CERTIFICATE_OF_RESIDENCY",
      "CERTIFICATE_OF_INDIGENCY",
      "BUSINESS_CLEARANCE",
    ]),
    purpose: z.string().min(3, "State the purpose"),
    subjectResidentId: z.string().min(1),
    businessName: z.string().optional(),
    businessAddress: z.string().optional(),
    businessNature: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "BUSINESS_CLEARANCE") {
      if (!data.businessName) {
        ctx.addIssue({
          code: "custom",
          path: ["businessName"],
          message: "Business name is required",
        });
      }
      if (!data.businessAddress) {
        ctx.addIssue({
          code: "custom",
          path: ["businessAddress"],
          message: "Business address is required",
        });
      }
      if (!data.businessNature) {
        ctx.addIssue({
          code: "custom",
          path: ["businessNature"],
          message: "Nature of business is required",
        });
      }
    }
  });

export const complaintSchema = z.object({
  category: z.enum([
    "NOISE",
    "WASTE",
    "STREETLIGHT",
    "DISTURBANCE",
    "INFRASTRUCTURE",
    "OTHER",
  ]),
  description: z.string().min(10, "Describe the issue"),
  location: z.string().min(3, "Where did this happen?"),
});

export const announcementSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  priority: z.enum(["NORMAL", "HIGH", "URGENT"]),
  publishedAt: z.string().optional(),
  expiresAt: z.string().optional(),
});

export const budgetLineSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  category: z.enum([
    "PERSONAL_SERVICES",
    "MOOE",
    "CAPITAL_OUTLAY",
    "SK_FUND",
    "GAD",
    "CALAMITY",
    "DEVELOPMENT",
    "PEACE_AND_ORDER",
    "HEALTH",
    "OTHER",
  ]),
  title: z.string().min(3, "Name the allocation"),
  allocated: z.coerce.number().min(0, "Allocated amount is required"),
  notes: z.string().optional(),
});

export const budgetExpenseSchema = z.object({
  lineId: z.string().min(1),
  spentAt: z.string().min(1, "Date of expense"),
  amount: z.coerce.number().positive("Amount must be more than zero"),
  payee: z.string().optional(),
  description: z.string().min(3, "Describe the expense"),
  referenceNo: z.string().optional(),
});

export const officialSchema = z.object({
  name: z.string().min(3, "Name the official"),
  role: z.enum([
    "PUNONG_BARANGAY",
    "BARANGAY_KAGAWAD",
    "SECRETARY",
    "TREASURER",
    "SK_CHAIRPERSON",
    "SK_KAGAWAD",
    "TANOD",
    "HEALTH_WORKER",
    "OTHER",
  ]),
  committee: z.string().optional(),
  contactNumber: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  published: z.boolean().optional(),
});

export const achievementSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.enum(["AWARD", "CERTIFICATE", "RECOGNITION", "SEAL", "OTHER"]),
  awardedBy: z.string().optional(),
  awardedAt: z.string().min(1, "When was this awarded?"),
  publishedAt: z.string().optional(),
});

export const inventoryItemSchema = z
  .object({
    name: z.string().min(2, "Name the item"),
    category: z.enum([
      "FURNITURE",
      "EVENT",
      "AUDIO_VISUAL",
      "VEHICLE",
      "COMMUNICATION",
      "DISASTER",
      "SPORTS",
      "OFFICE",
      "OTHER",
    ]),
    quantity: z.coerce.number().int().min(1),
    quantityOut: z.coerce.number().int().min(0),
    condition: z.enum(["GOOD", "FAIR", "NEEDS_REPAIR", "UNUSABLE"]),
    location: z.string().optional(),
    propertyNumber: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((d) => d.quantityOut <= d.quantity, {
    message: "Items out cannot be more than the total quantity",
    path: ["quantityOut"],
  });

export const settingsSchema = z.object({
  barangayName: z.string().min(1),
  cityMunicipality: z.string().min(1),
  province: z.string().min(1),
  address: z.string().min(1),
  contactNumber: z.string().optional(),
  captainName: z.string().min(1),
  secretaryName: z.string().min(1),
  clearanceFee: z.coerce.number().min(0),
  residencyFee: z.coerce.number().min(0),
  indigencyFee: z.coerce.number().min(0),
  businessClearanceFee: z.coerce.number().min(0),
  certificateValidityDays: z.coerce.number().int().min(1),
});

export const staffUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(["STAFF", "ADMIN"]),
});

export const updateUserAccountSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z
    .string()
    .optional()
    .transform((v) => v?.trim() || undefined)
    .pipe(passwordRules.optional()),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[0-9]/, "Include a number"),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
