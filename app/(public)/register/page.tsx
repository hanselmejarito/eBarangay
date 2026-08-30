import { RegisterForm } from "@/features/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold">Resident registration</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Create an account and upload a valid ID. Staff will verify you against
        the household registry before certificates or a QR ID can be issued.
      </p>
      <div className="mt-6">
        <RegisterForm />
      </div>
    </div>
  );
}
