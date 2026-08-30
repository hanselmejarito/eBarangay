import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { PRIORITY_LABELS } from "@/lib/constants";
import { deleteAnnouncementFormAction } from "@/features/announcements/actions";
import { SubmitButton } from "@/components/submit-button";
import { ListPagination } from "@/components/list-pagination";
import { paginationFromSearch, paginationMeta } from "@/lib/pagination";

export default async function StaffAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const { page, pageSize } = await searchParams;
  const paging = paginationFromSearch({ page, pageSize });
  const total = await prisma.announcement.count();
  const meta = paginationMeta(total, paging.page, paging.pageSize);
  const rows = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    skip: meta.skip,
    take: meta.take,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">Announcements</h1>
        <Button asChild>
          <Link href="/staff/announcements/new">New announcement</Link>
        </Button>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No announcements" />
      ) : (
        <div className="space-y-2">
          {rows.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Link href={`/staff/announcements/${a.id}`} className="font-medium text-primary">
                  {a.title}
                </Link>
                <div className="mt-1">
                  <Badge variant="outline">{PRIORITY_LABELS[a.priority]}</Badge>
                </div>
              </div>
              <form action={deleteAnnouncementFormAction}>
                <input type="hidden" name="id" value={a.id} />
                <SubmitButton variant="ghost">Delete</SubmitButton>
              </form>
            </div>
          ))}
        </div>
      )}
      <ListPagination
        pathname="/staff/announcements"
        page={meta.page}
        pageSize={meta.pageSize}
        total={total}
      />
    </div>
  );
}
