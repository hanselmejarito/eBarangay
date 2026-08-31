import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";
import { getResidentContext, requireUser } from "@/lib/rbac";
import { DOCUMENT_LABELS, formatResidentName } from "@/lib/constants";
import { countUnreadNotices } from "@/lib/announcement-notice-sql";

export default async function PortalHomePage() {
  const user = await requireUser();
  const me = await getResidentContext(user.id);
  const unread = me ? await countUnreadNotices(me.id) : 0;
  const requests = me
    ? await prisma.documentRequest.findMany({
        where: { requestedByUserId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">
          {me ? `Mabuhay, ${formatResidentName(me)}` : "Resident portal"}
        </h1>
        <p className="text-muted-foreground">
          {me
            ? `${me.household.purok} · Household ${me.household.householdNumber}`
            : "Your resident profile is still being linked."}
        </p>
      </div>
      {me ? <StatusBadge value={me.verificationStatus} /> : null}
      {unread > 0 ? (
        <Card>
          <CardContent className="pt-6">
            You have {unread} new hall {unread === 1 ? "notice" : "notices"}.{" "}
            <Link href="/portal/notices" className="text-primary underline">
              Open notices
            </Link>
          </CardContent>
        </Card>
      ) : null}
      {user.mustChangePassword ? (
        <Card>
          <CardContent className="pt-6">
            Please{" "}
            <Link href="/portal/password" className="text-primary underline">
              change your password
            </Link>{" "}
            before using hall services.
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Request a document</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/portal/requests/new">New request</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>File a complaint</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/portal/complaints/new">New complaint</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resident ID</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/portal/id">View QR ID</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div>
        <h2 className="mb-3 text-lg font-semibold">Recent requests</h2>
        <div className="space-y-2">
          {requests.map((r) => (
            <Link
              key={r.id}
              href={`/portal/requests/${r.id}`}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
            >
              <span>{DOCUMENT_LABELS[r.type]}</span>
              <StatusBadge value={r.status} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
