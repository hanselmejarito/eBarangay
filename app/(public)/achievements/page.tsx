import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { listPublishedAchievements } from "@/lib/achievement-sql";
import { connection } from "next/server";
import { ACHIEVEMENT_LABELS } from "@/lib/constants";
import { fileUrl } from "@/lib/files";

export default async function AchievementsPage() {
  await connection();
  const items = await listPublishedAchievements();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold">Awards & certificates</h1>
      <p className="mt-2 text-muted-foreground">
        Recognitions received by the barangay from the city, DILG, and other agencies.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {items.length === 0 ? (
          <div className="md:col-span-2">
            <EmptyState
              title="No awards posted yet"
              description="The hall will publish certificates and recognitions here."
            />
          </div>
        ) : (
          items.map((a) => (
            <Card key={a.id} className="overflow-hidden">
              {a.imagePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fileUrl(a.imagePath) ?? ""}
                  alt=""
                  className="h-48 w-full object-cover"
                />
              ) : null}
              <CardHeader>
                <Badge variant="outline">{ACHIEVEMENT_LABELS[a.category]}</Badge>
                <CardTitle>
                  <Link href={`/achievements/${a.id}`} className="hover:text-primary">
                    {a.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>
                  {a.awardedAt.toLocaleDateString("en-PH", { dateStyle: "long" })}
                  {a.awardedBy ? ` · ${a.awardedBy}` : ""}
                </p>
                <p className="line-clamp-3">{a.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
