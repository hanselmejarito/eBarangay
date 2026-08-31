import { notFound } from "next/navigation";
import { BudgetLineForm } from "@/features/budget/budget-line-form";
import { BudgetExpenseForm } from "@/features/budget/budget-expense-form";
import { getBudgetLine, listBudgetExpenses } from "@/lib/budget-sql";
import { pesos } from "@/lib/constants";
import { fileUrl } from "@/lib/files";
import { deleteBudgetExpenseFormAction } from "@/features/budget/actions";
import { SubmitButton } from "@/components/submit-button";
import { EmptyState } from "@/components/empty-state";
import { FeedbackForm } from "@/components/feedback-form";

export default async function BudgetLineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [line, expenses] = await Promise.all([
    getBudgetLine(id),
    listBudgetExpenses(id),
  ]);
  if (!line) notFound();
  const remaining = line.allocated - line.spent;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold">{line.title}</h1>
        <p className="text-sm text-muted-foreground">
          {line.year} · Allocated {pesos(line.allocated)} · Spent {pesos(line.spent)} ·
          Remaining {pesos(remaining)}
        </p>
      </div>
      <section className="max-w-2xl space-y-3">
        <h2 className="font-semibold">Record an expense</h2>
        <BudgetExpenseForm lineId={line.id} />
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold">Expenses</h2>
        {expenses.length === 0 ? (
          <EmptyState title="No expenses yet" />
        ) : (
          <div className="space-y-2">
            {expenses.map((e) => (
              <div
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{pesos(e.amount)}</p>
                  <p className="text-sm text-muted-foreground">{e.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.spentAt.toLocaleDateString("en-PH", { dateStyle: "medium" })}
                    {e.payee ? ` · ${e.payee}` : ""}
                    {e.referenceNo ? ` · ${e.referenceNo}` : ""}
                  </p>
                  {e.receiptPath ? (
                    <a
                      href={fileUrl(e.receiptPath) ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-sm text-primary"
                    >
                      View receipt
                    </a>
                  ) : null}
                </div>
                <FeedbackForm action={deleteBudgetExpenseFormAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="lineId" value={line.id} />
                  <SubmitButton variant="ghost">Delete</SubmitButton>
                </FeedbackForm>
              </div>
            ))}
          </div>
        )}
      </section>
      <section>
        <h2 className="mb-3 font-semibold">Update allocation</h2>
        <BudgetLineForm
          id={line.id}
          defaults={{
            year: line.year,
            category: line.category,
            title: line.title,
            allocated: line.allocated,
            notes: line.notes,
          }}
        />
      </section>
    </div>
  );
}
