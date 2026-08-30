import { PasswordForm } from "@/features/auth/password-form";

export default function StaffPasswordPage() {
  return (
    <div>
      <h1 className="mb-4 font-serif text-2xl font-semibold">Change password</h1>
      <PasswordForm />
    </div>
  );
}
