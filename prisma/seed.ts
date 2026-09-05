import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { saveBuffer } from "../lib/files";

const prisma = new PrismaClient();

/** Puts the sample seal through the same upload pipeline the admin form uses. */
async function seedBarangayLogo() {
  try {
    const png = await readFile(
      path.join(process.cwd(), "public", "demo", "barangay-san-roque-seal.png"),
    );
    return await saveBuffer(png, "settings", "png");
  } catch {
    return null;
  }
}

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.documentRequest.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.barangayOfficial.deleteMany();
  await prisma.budgetExpense.deleteMany();
  await prisma.budgetLine.deleteMany();
  await prisma.controlCounter.deleteMany();
  await prisma.household.updateMany({ data: { headResidentId: null } });
  await prisma.resident.deleteMany();
  await prisma.household.deleteMany();
  await prisma.user.deleteMany();
  await prisma.settings.deleteMany();

  const password = (plain: string) => bcrypt.hash(plain, 10);

  await prisma.settings.create({
    data: {
      barangayName: "Barangay San Roque",
      cityMunicipality: "Quezon City",
      province: "Metro Manila",
      address: "San Roque Hall, Quezon City",
      contactNumber: "(02) 8888-1000",
      captainName: "Hon. Maria Santos",
      secretaryName: "Jose Dela Cruz",
      clearanceFee: 50,
      residencyFee: 50,
      indigencyFee: 0,
      businessClearanceFee: 300,
      certificateValidityDays: 180,
      logoPath: await seedBarangayLogo(),
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@ebarangay.local",
      passwordHash: await password("Admin123!"),
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: "staff@ebarangay.local",
      passwordHash: await password("Staff123!"),
      role: "STAFF",
      status: "ACTIVE",
    },
  });

  const juanUser = await prisma.user.create({
    data: {
      email: "juan@ebarangay.local",
      passwordHash: await password("Resident123!"),
      role: "RESIDENT",
      status: "ACTIVE",
    },
  });

  const pendingUser = await prisma.user.create({
    data: {
      email: "ana@ebarangay.local",
      passwordHash: await password("Resident123!"),
      role: "RESIDENT",
      status: "PENDING_VERIFICATION",
    },
  });

  const household = await prisma.household.create({
    data: {
      householdNumber: "HH-0001",
      purok: "Purok 2",
      streetAddress: "123 Mabini Street",
    },
  });

  const juan = await prisma.resident.create({
    data: {
      userId: juanUser.id,
      householdId: household.id,
      firstName: "Juan",
      middleName: "Reyes",
      lastName: "Dela Cruz",
      birthdate: new Date("1988-05-12"),
      gender: "MALE",
      civilStatus: "MARRIED",
      contactNumber: "09171234567",
      isSenior: false,
      isRegisteredVoter: true,
      verificationStatus: "VERIFIED",
      verifiedById: staff.id,
      verifiedAt: new Date(),
      privacyConsentAt: new Date(),
    },
  });

  const maria = await prisma.resident.create({
    data: {
      householdId: household.id,
      firstName: "Maria",
      middleName: "Reyes",
      lastName: "Dela Cruz",
      birthdate: new Date("1990-11-03"),
      gender: "FEMALE",
      civilStatus: "MARRIED",
      contactNumber: "09181234567",
      isSoloParent: true,
      isRegisteredVoter: true,
      verificationStatus: "VERIFIED",
      verifiedById: staff.id,
      verifiedAt: new Date(),
    },
  });

  await prisma.resident.create({
    data: {
      householdId: household.id,
      firstName: "Pedro",
      lastName: "Dela Cruz",
      birthdate: new Date("2015-02-20"),
      gender: "MALE",
      civilStatus: "SINGLE",
      verificationStatus: "VERIFIED",
      verifiedById: staff.id,
      verifiedAt: new Date(),
    },
  });

  await prisma.resident.create({
    data: {
      householdId: household.id,
      firstName: "Carlo",
      lastName: "Dela Cruz",
      birthdate: new Date("2008-06-15"),
      gender: "MALE",
      civilStatus: "SINGLE",
      isSkVoter: true,
      isRegisteredVoter: true,
      verificationStatus: "VERIFIED",
      verifiedById: staff.id,
      verifiedAt: new Date(),
    },
  });

  await prisma.household.update({
    where: { id: household.id },
    data: { headResidentId: juan.id },
  });

  const pendingHousehold = await prisma.household.create({
    data: {
      householdNumber: "TMP-0002",
      purok: "Purok 4",
      streetAddress: "45 Luna Street",
    },
  });

  await prisma.resident.create({
    data: {
      userId: pendingUser.id,
      householdId: pendingHousehold.id,
      firstName: "Ana",
      lastName: "Garcia",
      birthdate: new Date("1995-08-09"),
      gender: "FEMALE",
      civilStatus: "SINGLE",
      contactNumber: "09201234567",
      verificationStatus: "PENDING",
      privacyConsentAt: new Date(),
    },
  });

  await prisma.household.update({
    where: { id: pendingHousehold.id },
    data: {
      headResidentId: (
        await prisma.resident.findFirstOrThrow({
          where: { userId: pendingUser.id },
        })
      ).id,
    },
  });

  await prisma.documentRequest.create({
    data: {
      type: "BARANGAY_CLEARANCE",
      status: "PENDING",
      purpose: "Local employment requirement",
      subjectResidentId: juan.id,
      requestedByUserId: juanUser.id,
      feeAmount: 50,
    },
  });

  await prisma.complaint.create({
    data: {
      category: "NOISE",
      description:
        "Loud videoke past 10:00 PM near the corner of Mabini and Luna.",
      location: "Purok 2, Mabini Street",
      photoPaths: [],
      status: "NEW",
      reportedById: juanUser.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: "Free medical mission this Saturday",
      content:
        "The barangay health station will host a medical mission from 8:00 AM to 3:00 PM. Bring your barangay ID or a valid ID.",
      priority: "HIGH",
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdById: staff.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: "Schedule of barangay hall hours",
      content:
        "Walk-in document requests are accepted Monday to Friday, 8:00 AM to 5:00 PM. Closed on holidays.",
      priority: "NORMAL",
      publishedAt: new Date(),
      createdById: admin.id,
    },
  });

  await prisma.achievement.create({
    data: {
      title: "Seal of Good Local Governance — Barangay Level",
      description:
        "Barangay San Roque was recognized for transparent financial management, peace and order programs, and on-time submission of reports to the city.",
      category: "SEAL",
      awardedBy: "DILG – Quezon City",
      awardedAt: new Date("2025-11-18"),
      publishedAt: new Date(),
      createdById: admin.id,
    },
  });

  await prisma.achievement.create({
    data: {
      title: "Best Barangay Solid Waste Management Program",
      description:
        "Awarded during the city environment month for the materials recovery facility and weekly clean-up drives in all puroks.",
      category: "AWARD",
      awardedBy: "Quezon City Environment Department",
      awardedAt: new Date("2025-06-12"),
      publishedAt: new Date(),
      createdById: staff.id,
    },
  });

  await prisma.inventoryItem.createMany({
    data: [
      {
        name: "Monoblock chairs",
        category: "FURNITURE",
        quantity: 200,
        quantityOut: 40,
        condition: "GOOD",
        location: "Hall storage",
        createdById: staff.id,
      },
      {
        name: "Folding tables",
        category: "FURNITURE",
        quantity: 20,
        quantityOut: 2,
        condition: "FAIR",
        location: "Hall storage",
        createdById: staff.id,
      },
      {
        name: "Canopy tents (10x10)",
        category: "EVENT",
        quantity: 8,
        quantityOut: 0,
        condition: "GOOD",
        location: "Back warehouse",
        createdById: staff.id,
      },
      {
        name: "Portable sound system",
        category: "AUDIO_VISUAL",
        quantity: 2,
        quantityOut: 1,
        condition: "GOOD",
        location: "Secretary office",
        notes: "One set borrowed for a wake on Mabini St.",
        createdById: staff.id,
      },
      {
        name: "Handheld radios",
        category: "COMMUNICATION",
        quantity: 6,
        quantityOut: 0,
        condition: "GOOD",
        location: "Tanod desk",
        createdById: admin.id,
      },
      {
        name: "Generator (5 kVA)",
        category: "DISASTER",
        quantity: 1,
        quantityOut: 0,
        condition: "NEEDS_REPAIR",
        location: "Back warehouse",
        notes: "Needs new spark plug.",
        createdById: admin.id,
      },
    ],
  });

  await prisma.barangayOfficial.createMany({
    data: [
      {
        name: "Hon. Maria Santos",
        role: "PUNONG_BARANGAY",
        sortOrder: 10,
        createdById: admin.id,
      },
      {
        name: "Jose Dela Cruz",
        role: "SECRETARY",
        sortOrder: 20,
        createdById: admin.id,
      },
      {
        name: "Ana Reyes",
        role: "TREASURER",
        sortOrder: 30,
        createdById: admin.id,
      },
      {
        name: "Hon. Roberto Lim",
        role: "BARANGAY_KAGAWAD",
        committee: "Peace and Order",
        sortOrder: 40,
        createdById: staff.id,
      },
      {
        name: "Hon. Luzviminda Cruz",
        role: "BARANGAY_KAGAWAD",
        committee: "Health and Sanitation",
        sortOrder: 41,
        createdById: staff.id,
      },
      {
        name: "Hon. Carlo Mendoza",
        role: "BARANGAY_KAGAWAD",
        committee: "Infrastructure",
        sortOrder: 42,
        createdById: staff.id,
      },
      {
        name: "Hon. Princess Navarro",
        role: "SK_CHAIRPERSON",
        committee: "Youth and Sports",
        sortOrder: 50,
        createdById: staff.id,
      },
      {
        name: "Hon. Mark Villanueva",
        role: "SK_KAGAWAD",
        committee: "Education",
        sortOrder: 60,
        createdById: staff.id,
      },
    ],
  });

  const mooe = await prisma.budgetLine.create({
    data: {
      year: 2026,
      category: "MOOE",
      title: "Office supplies and utilities",
      allocated: 180000,
      createdById: admin.id,
    },
  });
  await prisma.budgetLine.createMany({
    data: [
      {
        year: 2026,
        category: "SK_FUND",
        title: "SK youth programs",
        allocated: 150000,
        createdById: admin.id,
      },
      {
        year: 2026,
        category: "CALAMITY",
        title: "DRRM / calamity fund",
        allocated: 120000,
        createdById: admin.id,
      },
      {
        year: 2026,
        category: "PEACE_AND_ORDER",
        title: "Tanod honoraria and patrol",
        allocated: 200000,
        createdById: staff.id,
      },
      {
        year: 2026,
        category: "HEALTH",
        title: "Health station supplies",
        allocated: 80000,
        createdById: staff.id,
      },
    ],
  });
  await prisma.budgetExpense.create({
    data: {
      lineId: mooe.id,
      spentAt: new Date("2026-02-10"),
      amount: 12500,
      payee: "QC Office Depot",
      description: "Bond paper, ink, and folders",
      referenceNo: "DV-2026-001",
      createdById: staff.id,
    },
  });

  console.log("Seeded eBarangay demo data.");
  console.log("  Admin:    admin@ebarangay.local / Admin123!");
  console.log("  Staff:    staff@ebarangay.local / Staff123!");
  console.log("  Resident: juan@ebarangay.local / Resident123!");
  console.log("  Pending:  ana@ebarangay.local / Resident123!");
  console.log("  Household members without login: Maria, Pedro, Carlo");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
