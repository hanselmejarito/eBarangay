import { HouseholdForm } from "@/features/households/household-form";

export default function NewHouseholdPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Add household</h1>
      <HouseholdForm />
    </div>
  );
}
