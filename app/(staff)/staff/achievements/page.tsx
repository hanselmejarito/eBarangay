import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { countAchievements, listAllAchievements } from "@/lib/achievement-sql";
import { ListPagination } from "@/components/list-pagination";
import { paginationFromSearch, paginationMeta } from "@/lib/pagination";
import { ACHIEVEMENT_LABELS } from "@/lib/constants";
import { deleteAchievementFormAction } from "@/features/achievements/actions";
import { SubmitButton } from "@/components/submit-button";
import { FeedbackForm } from "@/components/feedback-form";

export default async function StaffAchievementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const { page, pageSize } = await searchParams;
  const paging = paginationFromSearch({ page, pageSize });
  const total = await countAchievements();
  const meta = paginationMeta(total, paging.page, paging.pageSize);
  const rows = await listAllAchievements({ skip: meta.skip, take: meta.take });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">Awards & certificates</h1>
        <Button asChild>
          <Link href="/staff/achievements/new">Add achievement</Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Post seals, plaques, and certificates the barangay received. These appear
        on the public website.
      </p>
      {rows.length === 0 ? (
        <EmptyState title="No achievements yet" />
      ) : (
        <div className="space-y-2">
          {rows.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Link href={`/staff/achievements/${a.id}`} className="font-medium text-primary">
                  {a.title}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{ACHIEVEMENT_LABELS[a.category]}</Badge>
                  <span>
                    {a.awardedAt.toLocaleDateString("en-PH", { dateStyle: "medium" })}
                  </span>
                  {a.awardedBy ? <span>· {a.awardedBy}</span> : null}
                </div>
              </div>
              <FeedbackForm action={deleteAchievementFormAction}>
                <input type="hidden" name="id" value={a.id} />
                <SubmitButton variant="ghost">Delete</SubmitButton>
              </FeedbackForm>
            </div>
          ))}
        </div>
      )}
      <ListPagination
        pathname="/staff/achievements"
        page={meta.page}
        pageSize={meta.pageSize}
        total={total}
      />
    </div>
  );
}
