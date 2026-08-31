import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { countOfficials, listOfficials } from "@/lib/official-sql";
import { ListPagination } from "@/components/list-pagination";
import { paginationFromSearch, paginationMeta } from "@/lib/pagination";
import { OFFICIAL_ROLE_LABELS } from "@/lib/constants";
import { deleteOfficialFormAction } from "@/features/officials/actions";
import { FeedbackForm } from "@/components/feedback-form";
import { SubmitButton } from "@/components/submit-button";

export default async function StaffOfficialsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const { page, pageSize } = await searchParams;
  const paging = paginationFromSearch({ page, pageSize });
  const total = await countOfficials();
  const meta = paginationMeta(total, paging.page, paging.pageSize);
  const rows = await listOfficials(false, { skip: meta.skip, take: meta.take });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Officials</h1>
          <p className="text-sm text-muted-foreground">
            Punong Barangay, kagawad, secretary, treasurer, and SK council.
          </p>
        </div>
        <Button asChild>
          <Link href="/staff/officials/new">Add official</Link>
        </Button>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No officials yet" />
      ) : (
        <div className="space-y-2">
          {rows.map((o) => (
            <div key={o.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Link href={`/staff/officials/${o.id}`} className="font-medium text-primary">
                  {o.name}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{OFFICIAL_ROLE_LABELS[o.role] ?? o.role}</Badge>
                  {o.committee ? <span>{o.committee}</span> : null}
                  {o.published ? null : <Badge variant="secondary">Hidden</Badge>}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/staff/officials/${o.id}`}>Update</Link>
                </Button>
                <FeedbackForm action={deleteOfficialFormAction}>
                  <input type="hidden" name="id" value={o.id} />
                  <SubmitButton variant="ghost">Delete</SubmitButton>
                </FeedbackForm>
              </div>
            </div>
          ))}
        </div>
      )}
      <ListPagination
        pathname="/staff/officials"
        page={meta.page}
        pageSize={meta.pageSize}
        total={total}
      />
    </div>
  );
}
