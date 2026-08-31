import { notFound } from "next/navigation";
import { AnnouncementForm } from "@/features/announcements/announcement-form";
import { NotifyResidentsButton } from "@/features/announcements/notify-button";
import { prisma } from "@/lib/prisma";
import { fileUrl } from "@/lib/files";
import { listNoticesForAnnouncement } from "@/lib/announcement-notice-sql";
import { isLiveEmailConfigured } from "@/lib/notify";
import { Badge } from "@/components/ui/badge";

function localInput(d: Date | null) {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, notices] = await Promise.all([
    prisma.announcement.findUnique({ where: { id } }),
    listNoticesForAnnouncement(id),
  ]);
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold">Edit announcement</h1>
      <AnnouncementForm
        id={item.id}
        liveEmail={isLiveEmailConfigured()}
        defaults={{
          title: item.title,
          content: item.content,
          priority: item.priority,
          publishedAt: localInput(item.publishedAt),
          expiresAt: localInput(item.expiresAt),
          coverUrl: fileUrl(item.coverPath),
        }}
      />
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recipients</h2>
        <p className="text-sm text-muted-foreground">
          Verified living residents with a login email and/or contact number.
          {isLiveEmailConfigured()
            ? " Email sent = arrived at Gmail. Recorded = Resend rejected it (often because the address is not your Resend account email, or it is a .local demo address)."
            : " Status recorded means it was logged only — RESEND_API_KEY is not set, so nothing went to Gmail."}
        </p>
        {notices.length === 0 ? (
          <NotifyResidentsButton id={item.id} />
        ) : (
          <div className="space-y-2">
            {notices.map((n) => (
              <div
                key={n.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
              >
                <p className="font-medium">
                  {n.firstName} {n.lastName}
                </p>
                <div className="flex flex-wrap gap-2">
                  {n.email ? (
                    <Badge variant="secondary">
                      {n.email} · {n.emailStatus.toLowerCase()}
                    </Badge>
                  ) : (
                    <Badge variant="outline">No email</Badge>
                  )}
                  {n.mobile ? (
                    <Badge variant="secondary">
                      {n.mobile} · {n.smsStatus.toLowerCase()}
                    </Badge>
                  ) : (
                    <Badge variant="outline">No mobile</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
