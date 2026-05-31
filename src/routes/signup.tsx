import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({ meta: [{ title: "Create account — BUTTERBYTE STORE" }] }),
  component: SignupPage,
});

const NAME_RE = /^[A-Za-z][A-Za-z\s'\-.]{1,39}$/;
function validName(s: string) {
  const v = s.trim();
  return NAME_RE.test(v) && /[aeiouAEIOU]/.test(v) && !/(.)\1{3,}/.test(v);
}

function SignupPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validName(firstName) || !validName(lastName)) {
      return toast.error("Please enter a valid first and last name.");
    }
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/account`,
        data: { full_name: `${firstName.trim()} ${lastName.trim()}` },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome to BUTTERBYTE STORE!");
    navigate({ to: (redirect as any) || "/account" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-md w-full px-6 py-12">
        <h1 className="font-display text-4xl mb-2">Create account</h1>
        <p className="text-sm text-muted-foreground mb-6">Join BUTTERBYTE STORE in seconds.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" value={firstName} onChange={setFirstName} required />
            <Field label="Last name" value={lastName} onChange={setLastName} required />
          </div>
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field label="Password (min 8 chars)" type="password" value={password} onChange={setPassword} required />
          <button disabled={busy} className="w-full bg-foreground text-background py-3 text-sm uppercase tracking-[0.2em] disabled:opacity-60">
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          Already a member?{" "}
          <Link to="/login" search={{ redirect } as any} className="underline text-foreground">
            Sign in
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
