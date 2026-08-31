import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/submit-button";
import { getResidentContext, requireUser } from "@/lib/rbac";
import { listNoticesForResident } from "@/lib/announcement-notice-sql";
import { PRIORITY_LABELS } from "@/lib/constants";
import type { AnnouncementPriority } from "@prisma/client";
import { openNoticeAction } from "@/features/announcements/notice-actions";

export default async function PortalNoticesPage() {
  const user = await requireUser();
  const me = await getResidentContext(user.id);
  if (!me) {
    return <p>No resident profile is linked to this account.</p>;
  }
  const notices = await listNoticesForResident(me.id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Notices</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hall announcements sent to your email {user.email}
          {me.contactNumber ? ` and ${me.contactNumber}` : ""}.
        </p>
      </div>
      {notices.length === 0 ? (
        <EmptyState
          title="No notices yet"
          description="When the hall publishes an announcement, it will appear here."
        />
      ) : (
        <div className="space-y-2">
          {notices.map((n) => (
            <form
              key={n.id}
              action={openNoticeAction}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <input type="hidden" name="id" value={n.id} />
              <input type="hidden" name="announcementId" value={n.announcementId} />
              <div className="min-w-0">
                <p className={n.readAt ? "font-medium" : "font-semibold"}>
                  {n.title}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {n.content}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {PRIORITY_LABELS[n.priority as AnnouncementPriority] ?? n.priority}
                  </Badge>
                  {n.email ? (
                    <Badge variant="secondary">Email {n.emailStatus.toLowerCase()}</Badge>
                  ) : null}
                  {n.mobile ? (
                    <Badge variant="secondary">SMS {n.smsStatus.toLowerCase()}</Badge>
                  ) : null}
                  {n.readAt ? null : <Badge>New</Badge>}
                </div>
              </div>
              <SubmitButton variant="outline" size="sm">
                Open
              </SubmitButton>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
