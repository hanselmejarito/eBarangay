import { PrismaClient } from "@prisma/client";

/** Bump this when schema fields change so the cached client is recreated. */
const CLIENT_GEN = "voter-life-v1";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaGen?: string;
};

function createClient() {
  return new PrismaClient();
}

if (!globalForPrisma.prisma || globalForPrisma.prismaGen !== CLIENT_GEN) {
  void globalForPrisma.prisma?.$disconnect();
  globalForPrisma.prisma = createClient();
  globalForPrisma.prismaGen = CLIENT_GEN;
}

export const prisma = globalForPrisma.prisma;
