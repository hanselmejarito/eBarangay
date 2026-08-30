import { ResidentForm } from "@/features/residents/resident-form";
import { prisma } from "@/lib/prisma";

export default async function NewResidentPage() {
  const households = await prisma.household.findMany({
    orderBy: { householdNumber: "asc" },
    select: { id: true, householdNumber: true },
  });
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Add resident</h1>
      <ResidentForm households={households} />
    </div>
  );
}
