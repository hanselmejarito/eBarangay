import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { prisma } from "@/lib/prisma";
import { PRIORITY_LABELS } from "@/lib/constants";
import { fileUrl } from "@/lib/files";

export default async function AnnouncementsPage() {
  const items = await prisma.announcement.findMany({
    where: {
      publishedAt: { lte: new Date() },
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
    },
    orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold">Announcements</h1>
      <div className="mt-8 space-y-4">
        {items.length === 0 ? (
          <EmptyState title="No announcements" description="Check back later for hall notices." />
        ) : (
          items.map((a) => (
            <Card key={a.id}>
              {a.coverPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fileUrl(a.coverPath) ?? ""}
                  alt=""
                  className="h-40 w-full rounded-t-xl object-cover"
                />
              ) : null}
              <CardHeader>
                <Badge variant="outline">{PRIORITY_LABELS[a.priority]}</Badge>
                <CardTitle>
                  <Link href={`/announcements/${a.id}`} className="hover:text-primary">
                    {a.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="line-clamp-4 text-sm text-muted-foreground">
                {a.content}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
