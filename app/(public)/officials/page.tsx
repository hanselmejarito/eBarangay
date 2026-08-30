import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { listOfficials } from "@/lib/official-sql";
import { OFFICIAL_ROLE_LABELS } from "@/lib/constants";
import { fileUrl } from "@/lib/files";

const GROUPS: { title: string; roles: string[] }[] = [
  { title: "Punong Barangay", roles: ["PUNONG_BARANGAY"] },
  { title: "Appointed officers", roles: ["SECRETARY", "TREASURER"] },
  { title: "Sangguniang Barangay", roles: ["BARANGAY_KAGAWAD"] },
  { title: "Sangguniang Kabataan", roles: ["SK_CHAIRPERSON", "SK_KAGAWAD"] },
  { title: "Other personnel", roles: ["TANOD", "HEALTH_WORKER", "OTHER"] },
];

export default async function OfficialsPage() {
  const items = await listOfficials(true);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold">Barangay officials</h1>
      <p className="mt-2 text-muted-foreground">
        Elected and appointed officials from the Punong Barangay to the SK council.
      </p>
      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No officials posted yet"
            description="The hall will publish the current set of officials here."
          />
        </div>
      ) : (
        <div className="mt-10 space-y-10">
          {GROUPS.map((group) => {
            const rows = items.filter((o) => group.roles.includes(o.role));
            if (rows.length === 0) return null;
            return (
              <section key={group.title}>
                <h2 className="mb-4 font-serif text-xl font-semibold">{group.title}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rows.map((o) => (
                    <Card key={o.id} className="overflow-hidden">
                      {o.photoPath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={fileUrl(o.photoPath) ?? ""}
                          alt=""
                          className="h-44 w-full object-cover"
                        />
                      ) : null}
                      <CardHeader>
                        <Badge variant="outline">
                          {OFFICIAL_ROLE_LABELS[o.role] ?? o.role}
                        </Badge>
                        <CardTitle className="text-lg">{o.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        {o.committee ? <p>{o.committee}</p> : null}
                        {o.contactNumber ? <p>{o.contactNumber}</p> : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
