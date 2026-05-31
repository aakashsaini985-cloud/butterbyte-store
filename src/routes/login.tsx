import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({ meta: [{ title: "Sign in — BUTTERBYTE STORE" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: (redirect as any) || "/account" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-md w-full px-6 py-12">
        <h1 className="font-display text-4xl mb-2">Sign in</h1>
        <p className="text-sm text-muted-foreground mb-6">Welcome back to BUTTERBYTE STORE.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Email" type="email" value={email} onChange={(v) => setEmail(v)} required />
          <Field label="Password" type="password" value={password} onChange={(v) => setPassword(v)} required />
          <button disabled={busy} className="w-full bg-foreground text-background py-3 text-sm uppercase tracking-[0.2em] disabled:opacity-60">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" search={{ redirect } as any} className="underline text-foreground">
            Create an account
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border px-3 py-2 bg-background focus:outline-none focus:border-foreground"
      />
    </label>
  );
}
