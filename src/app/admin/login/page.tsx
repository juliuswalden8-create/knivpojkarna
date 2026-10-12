import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";
import { Logo } from "@/components/brand/logo";

export const metadata = { title: "Admin login | KNIVPOJKARNA", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) redirect("/admin");
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-5">
      <div className="w-full max-w-md border-t border-line pt-10">
        <Logo variant="full" />
        <h1 className="mt-8 font-serif text-3xl">Admin</h1>
        <p className="mt-2 text-sm text-stone">Sign in to manage bookings and site content.</p>
        <LoginForm />
      </div>
    </div>
  );
}
