import Link from "next/link";
import { ArrowRight, FileText, IdCard, Megaphone, ShieldCheck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { listPublishedAchievements } from "@/lib/achievement-sql";
import { listOfficials } from "@/lib/official-sql";
import { getSettings } from "@/lib/settings";
import { ACHIEVEMENT_LABELS, OFFICIAL_ROLE_LABELS, PRIORITY_LABELS } from "@/lib/constants";
import { fileUrl } from "@/lib/files";
import { EmptyState } from "@/components/empty-state";

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

  const services = [
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
  ];

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#04122e] via-ph-blue to-[#1d4ed8] text-white">
        <div className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-ph-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 size-80 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-ph-gold">
              Republic of the Philippines
            </p>
            <h1 className="mt-5 font-serif text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              {settings.barangayName}
            </h1>
            <p className="mt-3 text-lg text-white/75">
              {settings.cityMunicipality}, {settings.province}
            </p>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">
              One-stop digital services for residents: request certificates, follow
              complaints, and keep a verified barangay ID.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="rounded-full bg-white text-ph-blue hover:bg-white/90" asChild>
                <Link href="/register">
                  Register as resident
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/30 bg-white/5 text-white hover:bg-white/15"
                asChild
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
          <Card className="border-0 bg-white/95 shadow-2xl backdrop-blur dark:bg-card/90">
            <CardHeader>
              <CardTitle className="text-lg">Hall information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <span className="text-muted-foreground">Address</span>
                <br />
                <span className="font-medium">{settings.address}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Punong Barangay</span>
                <br />
                <span className="font-medium">{settings.captainName}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Secretary</span>
                <br />
                <span className="font-medium">{settings.secretaryName}</span>
              </p>
              {settings.contactNumber ? (
                <p>
                  <span className="text-muted-foreground">Contact</span>
                  <br />
                  <span className="font-medium">{settings.contactNumber}</span>
                </p>
              ) : null}
              <Button variant="link" className="h-auto px-0" asChild>
                <Link href="/officials">
                  View all officials
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-14 sm:grid-cols-2 lg:grid-cols-5">
        {services.map((item) => (
          <Card key={item.title} className="h-full transition-transform hover:-translate-y-0.5">
            <CardHeader>
              <div className="mb-3 grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </div>
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              {item.text}
            </CardContent>
          </Card>
        ))}
      </section>

      {officials.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Leadership
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Barangay officials</h2>
            </div>
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/officials">View all</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {officials.slice(0, 4).map((o) => (
              <Card key={o.id}>
                <CardHeader>
                  <Badge variant="secondary">{OFFICIAL_ROLE_LABELS[o.role] ?? o.role}</Badge>
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

      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                From the hall
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Announcements</h2>
            </div>
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/announcements">View all</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {announcements.length === 0 ? (
              <div className="md:col-span-3">
                <EmptyState
                  title="No announcements"
                  description="Check back later for hall notices."
                />
              </div>
            ) : (
              announcements.map((a) => (
                <Card key={a.id} className="h-full">
                  <CardHeader>
                    <Badge variant="outline">{PRIORITY_LABELS[a.priority]}</Badge>
                    <CardTitle className="text-lg">
                      <Link href={`/announcements/${a.id}`} className="hover:text-primary">
                        {a.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {a.content}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {achievements.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Recognition
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Awards & certificates</h2>
            </div>
            <Button variant="outline" className="rounded-full" asChild>
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
                    className="h-40 w-full object-cover"
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
