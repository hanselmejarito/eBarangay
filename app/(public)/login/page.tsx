import { LoginForm } from "@/features/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; registered?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-3xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Use the email issued or registered with the barangay hall.
      </p>
      {params.registered ? (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Registration received. Staff will verify your identity before you can
          request documents.
        </p>
      ) : null}
      <div className="mt-6">
        <LoginForm next={params.next} />
      </div>
    </div>
  );
}
