import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/login-form";
import { getSessionUser, homePathForRole } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; registered?: string }>;
}) {
  const user = await getSessionUser();
  if (user) redirect(homePathForRole(user.role));

  const params = await searchParams;
  return (
    <div className="surface-grid flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 pb-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            eBarangay
          </p>
          <CardTitle className="font-serif text-3xl">Sign in</CardTitle>
          <p className="text-sm text-muted-foreground">
            Use the email issued or registered with the barangay hall.
          </p>
        </CardHeader>
        <CardContent>
          {params.registered ? (
            <p className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              Registration received. Staff will verify your identity before you can
              request documents.
            </p>
          ) : null}
          <LoginForm next={params.next} />
        </CardContent>
      </Card>
    </div>
  );
}
