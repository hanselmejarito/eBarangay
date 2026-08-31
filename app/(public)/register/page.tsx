import { redirect } from "next/navigation";
import { RegisterForm } from "@/features/auth/register-form";
import { getSessionUser, homePathForRole } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) redirect(homePathForRole(user.role));

  return (
    <div className="surface-grid px-4 py-12">
      <Card className="mx-auto max-w-2xl shadow-xl">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            New resident
          </p>
          <CardTitle className="font-serif text-3xl">Resident registration</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create an account and upload a valid ID. Staff will verify you against
            the household registry before certificates or a QR ID can be issued.
          </p>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
