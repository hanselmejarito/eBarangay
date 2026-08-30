import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  HouseholdRelation,
  LifeStatus,
  ResidencyStatus,
  VerificationStatus,
} from "@prisma/client";
import { isRegularVoterAge, isSkAge, yearsOld } from "@/lib/age";

const LIVING = Prisma.sql`AND "lifeStatus"::text = 'ALIVE'`;
const LIVING_R = Prisma.sql`AND r."lifeStatus"::text = 'ALIVE'`;

export const REGULAR_VOTER_SQL = Prisma.sql`
  AND DATE_PART('year', AGE(CURRENT_DATE, birthdate::date)) >= 18
  AND ("isRegisteredVoter" = true OR "isSkVoter" = true)
`;
export const SK_VOTER_SQL = Prisma.sql`
  AND "isSkVoter" = true
  AND DATE_PART('year', AGE(CURRENT_DATE, birthdate::date)) BETWEEN 15 AND 30
`;
const REGULAR_VOTER_PRED_R = Prisma.sql`
  DATE_PART('year', AGE(CURRENT_DATE, r.birthdate::date)) >= 18
  AND (r."isRegisteredVoter" = true OR r."isSkVoter" = true)
`;
const SK_VOTER_PRED_R = Prisma.sql`
  r."isSkVoter" = true
  AND DATE_PART('year', AGE(CURRENT_DATE, r.birthdate::date)) BETWEEN 15 AND 30
`;
const REGULAR_VOTER_SQL_R = Prisma.sql`
  AND DATE_PART('year', AGE(CURRENT_DATE, r.birthdate::date)) >= 18
  AND (r."isRegisteredVoter" = true OR r."isSkVoter" = true)
`;
const SK_VOTER_SQL_R = Prisma.sql`
  AND r."isSkVoter" = true
  AND DATE_PART('year', AGE(CURRENT_DATE, r.birthdate::date)) BETWEEN 15 AND 30
`;

export type ResidentListRow = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  birthdate: Date;
  isSenior: boolean;
  isPwd: boolean;
  isSoloParent: boolean;
  isRegisteredVoter: boolean;
  isSkVoter: boolean;
  verificationStatus: VerificationStatus;
  relation: HouseholdRelation;
  residencyStatus: ResidencyStatus;
  lifeStatus: LifeStatus;
  householdNumber: string;
  purok: string;
};

function and(parts: Prisma.Sql[]) {
  return Prisma.join(parts, " AND ");
}

export async function listResidentsSql(filters: {
  q?: string;
  status?: string;
  tag?: string;
  relation?: string;
  residency?: string;
  life?: string;
  skip?: number;
  take?: number;
}) {
  const parts: Prisma.Sql[] = [Prisma.sql`TRUE`];

  if (filters.status) {
    parts.push(Prisma.sql`r."verificationStatus"::text = ${filters.status}`);
  }
  if (filters.relation) {
    parts.push(Prisma.sql`r."relation"::text = ${filters.relation}`);
  }
  if (filters.residency) {
    parts.push(Prisma.sql`r."residencyStatus"::text = ${filters.residency}`);
  }
  if (filters.life) {
    parts.push(Prisma.sql`r."lifeStatus"::text = ${filters.life}`);
  }
  if (filters.tag === "senior") parts.push(Prisma.sql`r."isSenior" = true`);
  if (filters.tag === "pwd") parts.push(Prisma.sql`r."isPwd" = true`);
  if (filters.tag === "solo") parts.push(Prisma.sql`r."isSoloParent" = true`);
  if (filters.tag === "voter") parts.push(REGULAR_VOTER_PRED_R);
  if (filters.tag === "sk") parts.push(SK_VOTER_PRED_R);
  if (filters.q) {
    const q = `%${filters.q}%`;
    parts.push(
      Prisma.sql`(r."firstName" ILIKE ${q} OR r."lastName" ILIKE ${q} OR h."householdNumber" ILIKE ${q})`,
    );
  }

  return prisma.$queryRaw<ResidentListRow[]>`
    SELECT
      r.id,
      r."firstName",
      r."middleName",
      r."lastName",
      r.suffix,
      r.birthdate,
      r."isSenior",
      r."isPwd",
      r."isSoloParent",
      r."isRegisteredVoter",
      r."isSkVoter",
      r."verificationStatus",
      r."relation",
      r."residencyStatus",
      r."lifeStatus",
      h."householdNumber",
      h.purok
    FROM "Resident" r
    JOIN "Household" h ON h.id = r."householdId"
    WHERE ${and(parts)}
    ORDER BY r."lastName" ASC, r."firstName" ASC
    LIMIT ${filters.take ?? 10} OFFSET ${filters.skip ?? 0}
  `;
}

export async function countResidentsSql(filters: {
  q?: string;
  status?: string;
  tag?: string;
  relation?: string;
  residency?: string;
  life?: string;
}) {
  const parts: Prisma.Sql[] = [Prisma.sql`TRUE`];

  if (filters.status) {
    parts.push(Prisma.sql`r."verificationStatus"::text = ${filters.status}`);
  }
  if (filters.relation) {
    parts.push(Prisma.sql`r."relation"::text = ${filters.relation}`);
  }
  if (filters.residency) {
    parts.push(Prisma.sql`r."residencyStatus"::text = ${filters.residency}`);
  }
  if (filters.life) {
    parts.push(Prisma.sql`r."lifeStatus"::text = ${filters.life}`);
  }
  if (filters.tag === "senior") parts.push(Prisma.sql`r."isSenior" = true`);
  if (filters.tag === "pwd") parts.push(Prisma.sql`r."isPwd" = true`);
  if (filters.tag === "solo") parts.push(Prisma.sql`r."isSoloParent" = true`);
  if (filters.tag === "voter") parts.push(REGULAR_VOTER_PRED_R);
  if (filters.tag === "sk") parts.push(SK_VOTER_PRED_R);
  if (filters.q) {
    const q = `%${filters.q}%`;
    parts.push(
      Prisma.sql`(r."firstName" ILIKE ${q} OR r."lastName" ILIKE ${q} OR h."householdNumber" ILIKE ${q})`,
    );
  }

  const rows = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::bigint AS count
    FROM "Resident" r
    JOIN "Household" h ON h.id = r."householdId"
    WHERE ${and(parts)}
  `;
  return Number(rows[0]?.count ?? 0);
}

/** Verified, living in the barangay, and not deceased. */
export async function countActiveVerified(extra?: Prisma.Sql) {
  const rows = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::bigint AS count
    FROM "Resident"
    WHERE "verificationStatus"::text = 'VERIFIED'
      AND "residencyStatus"::text = 'ACTIVE'
      ${LIVING}
      ${extra ?? Prisma.empty}
  `;
  return Number(rows[0]?.count ?? 0);
}

export async function listReportResidentsSql(tag: string) {
  const extra =
    tag === "senior"
      ? Prisma.sql`AND r."isSenior" = true`
      : tag === "pwd"
        ? Prisma.sql`AND r."isPwd" = true`
        : tag === "solo"
          ? Prisma.sql`AND r."isSoloParent" = true`
          : tag === "voter"
            ? REGULAR_VOTER_SQL_R
            : tag === "sk"
              ? SK_VOTER_SQL_R
              : Prisma.empty;

  type ReportRow = {
    firstName: string;
    middleName: string | null;
    lastName: string;
    suffix: string | null;
    birthdate: Date;
    contactNumber: string | null;
    isSenior: boolean;
    isPwd: boolean;
    isSoloParent: boolean;
    isRegisteredVoter: boolean;
    isSkVoter: boolean;
    householdNumber: string;
    purok: string;
  };

  if (tag === "deceased") {
    return prisma.$queryRaw<ReportRow[]>`
      SELECT
        r."firstName",
        r."middleName",
        r."lastName",
        r.suffix,
        r.birthdate,
        r."contactNumber",
        r."isSenior",
        r."isPwd",
        r."isSoloParent",
        r."isRegisteredVoter",
        r."isSkVoter",
        h."householdNumber",
        h.purok
      FROM "Resident" r
      JOIN "Household" h ON h.id = r."householdId"
      WHERE r."lifeStatus"::text = 'DECEASED'
      ORDER BY r."lastName" ASC, r."firstName" ASC
    `;
  }

  return prisma.$queryRaw<ReportRow[]>`
    SELECT
      r."firstName",
      r."middleName",
      r."lastName",
      r.suffix,
      r.birthdate,
      r."contactNumber",
      r."isSenior",
      r."isPwd",
      r."isSoloParent",
      r."isRegisteredVoter",
      r."isSkVoter",
      h."householdNumber",
      h.purok
    FROM "Resident" r
    JOIN "Household" h ON h.id = r."householdId"
    WHERE r."verificationStatus"::text = 'VERIFIED'
      AND r."residencyStatus"::text = 'ACTIVE'
      ${LIVING_R}
      ${extra}
    ORDER BY r."lastName" ASC, r."firstName" ASC
  `;
}

export type ResidencyFields = {
  relation: HouseholdRelation;
  residencyStatus: ResidencyStatus;
  movedOutAt: Date | null;
  movedOutNote: string | null;
  isRegisteredVoter: boolean;
  isSkVoter: boolean;
  lifeStatus: LifeStatus;
  deceasedAt: Date | null;
  deathNote: string | null;
};

const DEFAULT_RESIDENCY: ResidencyFields = {
  relation: "MEMBER",
  residencyStatus: "ACTIVE",
  movedOutAt: null,
  movedOutNote: null,
  isRegisteredVoter: false,
  isSkVoter: false,
  lifeStatus: "ALIVE",
  deceasedAt: null,
  deathNote: null,
};

export async function getResidencyFields(residentId: string) {
  const rows = await prisma.$queryRaw<ResidencyFields[]>`
    SELECT
      "relation",
      "residencyStatus",
      "movedOutAt",
      "movedOutNote",
      "isRegisteredVoter",
      "isSkVoter",
      "lifeStatus",
      "deceasedAt",
      "deathNote"
    FROM "Resident"
    WHERE id = ${residentId}
  `;
  return rows[0] ?? DEFAULT_RESIDENCY;
}

export type HouseholdPersonRow = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  relation: HouseholdRelation;
  residencyStatus: ResidencyStatus;
  lifeStatus: LifeStatus;
};

export async function listHouseholdPeopleSql(householdId: string) {
  return prisma.$queryRaw<HouseholdPersonRow[]>`
    SELECT
      id,
      "firstName",
      "middleName",
      "lastName",
      suffix,
      "relation",
      "residencyStatus",
      "lifeStatus"
    FROM "Resident"
    WHERE "householdId" = ${householdId}
    ORDER BY "lastName" ASC, "firstName" ASC
  `;
}

export async function listActiveVerifiedHouseholdMembers(householdId: string) {
  return prisma.$queryRaw<
    {
      id: string;
      firstName: string;
      middleName: string | null;
      lastName: string;
      suffix: string | null;
    }[]
  >`
    SELECT id, "firstName", "middleName", "lastName", suffix
    FROM "Resident"
    WHERE "householdId" = ${householdId}
      AND "verificationStatus"::text = 'VERIFIED'
      AND "residencyStatus"::text = 'ACTIVE'
      ${LIVING}
    ORDER BY "lastName" ASC, "firstName" ASC
  `;
}

export async function countActiveMembersByHousehold() {
  const rows = await prisma.$queryRaw<{ householdId: string; count: bigint }[]>`
    SELECT "householdId", COUNT(*)::bigint AS count
    FROM "Resident"
    WHERE "residencyStatus"::text = 'ACTIVE'
      AND "relation"::text = 'MEMBER'
      ${LIVING}
    GROUP BY "householdId"
  `;
  return new Map(rows.map((r) => [r.householdId, Number(r.count)]));
}

export async function setResidentVoterFlags(
  id: string,
  isRegisteredVoter: boolean,
  isSkVoter: boolean,
  birthdate: Date,
) {
  const age = yearsOld(birthdate);
  const current = await prisma.$queryRaw<[{ isSkVoter: boolean }]>`
    SELECT "isSkVoter" FROM "Resident" WHERE id = ${id}
  `;
  const keepAgedOutSk = Boolean(current[0]?.isSkVoter) && age > 30;
  const nextSk = isSkAge(age) ? isSkVoter : keepAgedOutSk;
  const nextRegular = isRegisteredVoter && isRegularVoterAge(age);
  await prisma.$executeRaw`
    UPDATE "Resident"
    SET "isRegisteredVoter" = ${nextRegular},
        "isSkVoter" = ${nextSk}
    WHERE id = ${id}
  `;
}
