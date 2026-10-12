"use client";

import { useState } from "react";
import { loginAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await loginAction(formData);
    if (result && !result.ok) setError(result.error);
    setPending(false);
  }

  return (
    <form action={onSubmit} className="mt-8 grid gap-4">
      <label>
        <span className="kicker">Email</span>
        <input name="email" type="email" required autoComplete="username" className="field mt-2" />
      </label>
      <label>
        <span className="kicker">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className="field mt-2" />
      </label>
      {error && <p className="text-sm text-ember">{error}</p>}
      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
