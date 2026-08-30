import Link from "next/link";
import { FileText, IdCard, Megaphone, ShieldCheck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { listPublishedAchievements } from "@/lib/achievement-sql";
import { listOfficials } from "@/lib/official-sql";
import { getSettings } from "@/lib/settings";
import { ACHIEVEMENT_LABELS, OFFICIAL_ROLE_LABELS, PRIORITY_LABELS } from "@/lib/constants";
import { fileUrl } from "@/lib/files";

export default async function HomePage() {
  const settings = await getSettings();
  const [announcements, achievements, officials] = await Promise.all([
    prisma.announcement.findMany({
      where: {
        publishedAt: { lte: new Date() },
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
      take: 3,
    }),
    listPublishedAchievements(3),
    listOfficials(true),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden bg-ph-blue text-white">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-ph-gold/20 blur-2xl" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2 md:items-center md:py-16">
          <div>
            <p className="text-sm uppercase tracking-widest text-ph-gold">
              Republic of the Philippines
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl md:text-5xl">
              {settings.barangayName}
            </h1>
            <p className="mt-2 text-white/80">
              {settings.cityMunicipality}, {settings.province}
            </p>
            <p className="mt-6 max-w-lg text-base text-white/90 sm:text-lg">
              One-stop digital services for residents: request certificates, follow
              complaints, and keep a verified barangay ID.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">Register as resident</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white bg-transparent text-white hover:bg-white/10"
                asChild
              >
                <Link href="/login">Staff / resident sign in</Link>
              </Button>
            </div>
          </div>
          <Card className="bg-white/95 text-slate-900">
            <CardHeader>
              <CardTitle>Hall information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Address:</span>{" "}
                {settings.address}
              </p>
              <p>
                <span className="text-muted-foreground">Punong Barangay:</span>{" "}
                {settings.captainName}
              </p>
              <p>
                <span className="text-muted-foreground">Secretary:</span>{" "}
                {settings.secretaryName}
              </p>
              {settings.contactNumber ? (
                <p>
                  <span className="text-muted-foreground">Contact:</span>{" "}
                  {settings.contactNumber}
                </p>
              ) : null}
              <Button variant="link" className="h-auto px-0" asChild>
                <Link href="/officials">View all officials</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        {[
          {
            icon: FileText,
            title: "Certificates",
            text: "Clearance, residency, indigency, and business clearance with official control numbers.",
          },
          {
            icon: ShieldCheck,
            title: "Verified registry",
            text: "Staff verify residents against the household census before IDs and papers are issued.",
          },
          {
            icon: Megaphone,
            title: "Announcements",
            text: "Official notices from the hall, with priority and expiration dates.",
          },
          {
            icon: Trophy,
            title: "Awards",
            text: "Seals, plaques, and certificates the barangay has received.",
          },
          {
            icon: IdCard,
            title: "QR Resident ID",
            text: "Signed QR for verified residents. Staff scan to confirm identity.",
          },
        ].map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <item.icon className="mb-2 size-6 text-primary" />
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {item.text}
            </CardContent>
          </Card>
        ))}
      </section>

      {officials.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl font-semibold">Barangay officials</h2>
            <Button variant="link" asChild>
              <Link href="/officials">View all</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {officials.slice(0, 4).map((o) => (
              <Card key={o.id}>
                <CardHeader>
                  <Badge variant="outline">{OFFICIAL_ROLE_LABELS[o.role] ?? o.role}</Badge>
                  <CardTitle className="text-lg">{o.name}</CardTitle>
                </CardHeader>
                {o.committee ? (
                  <CardContent className="text-sm text-muted-foreground">{o.committee}</CardContent>
                ) : null}
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Announcements</h2>
          <Button variant="link" asChild>
            <Link href="/announcements">View all</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardHeader>
                <Badge variant="outline">{PRIORITY_LABELS[a.priority]}</Badge>
                <CardTitle className="text-lg">
                  <Link href={`/announcements/${a.id}`} className="hover:text-primary">
                    {a.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="line-clamp-3 text-sm text-muted-foreground">
                {a.content}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {achievements.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl font-semibold">Awards & certificates</h2>
            <Button variant="link" asChild>
              <Link href="/achievements">View all</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {achievements.map((a) => (
              <Card key={a.id} className="overflow-hidden">
                {a.imagePath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={fileUrl(a.imagePath) ?? ""}
                    alt=""
                    className="h-36 w-full object-cover"
                  />
                ) : null}
                <CardHeader>
                  <Badge variant="outline">{ACHIEVEMENT_LABELS[a.category]}</Badge>
                  <CardTitle className="text-lg">
                    <Link href={`/achievements/${a.id}`} className="hover:text-primary">
                      {a.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {a.awardedAt.toLocaleDateString("en-PH", { dateStyle: "medium" })}
                  {a.awardedBy ? ` · ${a.awardedBy}` : ""}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
