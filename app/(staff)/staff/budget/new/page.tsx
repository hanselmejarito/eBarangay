import { BudgetLineForm } from "@/features/budget/budget-line-form";

export default async function NewBudgetLinePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Add allocation</h1>
      <BudgetLineForm defaults={{ year: year ? Number(year) : undefined }} />
    </div>
  );
}
