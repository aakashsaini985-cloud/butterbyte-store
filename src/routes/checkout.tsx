import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { cart, useStore } from "@/lib/store";
import { inr } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — BUTTERBYTE STORE" }] }),
  component: Checkout,
});

// Indian name validation: letters, spaces, hyphens, apostrophes; 2–40 chars; must contain a vowel
// Blocks numbers, special chars, random gibberish like "asdf" by requiring vowel + consonant mix
const NAME_RE = /^[A-Za-z][A-Za-z\s'\-.]{1,39}$/;
function isValidIndianName(raw: string): boolean {
  const s = raw.trim();
  if (!NAME_RE.test(s)) return false;
  if (!/[aeiouAEIOU]/.test(s)) return false; // must contain a vowel
  if (/(.)\1{3,}/.test(s)) return false; // no 4+ repeated chars (aaaa)
  if (/^[bcdfghjklmnpqrstvwxyz]{5,}$/i.test(s.replace(/\s/g, ""))) return false;
  return true;
}

function Checkout() {
  const { cartItems } = useStore();
  const navigate = useNavigate();
  const subtotal = cartItems.reduce((s, l) => s + l.price * l.qty, 0);
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const total = subtotal + shipping;
  const [submitting, setSubmitting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; pincode?: string }>({});

  // Auto-fetch State/City from PIN
  useEffect(() => {
    if (!/^\d{6}$/.test(pincode)) {
      setPinError(null);
      return;
    }
    let cancelled = false;
    setPinLoading(true);
    setPinError(null);
    fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const entry = Array.isArray(data) ? data[0] : null;
        const office = entry?.PostOffice?.[0];
        if (entry?.Status === "Success" && office) {
          setCity(office.District || office.Block || office.Name || "");
          setState(office.State || "");
          setPinError(null);
        } else {
          setCity("");
          setState("");
          setPinError("Invalid PIN code. Please enter a valid Indian PIN code.");
        }
      })
      .catch(() => {
        if (!cancelled) setPinError("Could not look up PIN code. Please enter City and State manually.");
      })
      .finally(() => {
        if (!cancelled) setPinLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pincode]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!isValidIndianName(firstName)) newErrors.firstName = "Enter a valid first name (letters only).";
    if (!isValidIndianName(lastName)) newErrors.lastName = "Enter a valid last name (letters only).";
    if (!/^\d{6}$/.test(pincode)) newErrors.pincode = "Enter a valid 6-digit PIN code.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length) {
      toast.error("Please correct the highlighted fields.");
      return;
    }
    if (!city || !state) {
      toast.error("City and State could not be determined. Please re-check your PIN code.");
      return;
    }
    setSubmitting(true);
    const orderNo = "BB" + Date.now().toString().slice(-8);
    setTimeout(() => {
      cart.clear();
      navigate({ to: "/order-success", search: { o: orderNo } as any });
    }, 600);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Your bag is empty.</p>
            <Link to="/shop" className="mt-4 inline-block underline">Go shopping</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 w-full">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl mb-6 sm:mb-8">Checkout</h1>
        <form onSubmit={onSubmit} className="grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-10">
          <div className="space-y-6">
            <Section title="Contact">
              <Input label="Email" type="email" name="email" required />
              <Input label="Phone" type="tel" name="phone" required pattern="[6-9][0-9]{9}" title="Enter a valid 10-digit Indian mobile number" />
            </Section>
            <Section title="Shipping Address">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="First Name *"
                  name="firstName"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  error={errors.firstName}
                />
                <Input
                  label="Last Name *"
                  name="lastName"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  error={errors.lastName}
                />
              </div>
              <Input label="Address line 1" name="line1" required />
              <Input label="Address line 2 (optional)" name="line2" />
              <Input
                label="PIN code *"
                name="pincode"
                required
                inputMode="numeric"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                error={errors.pincode || pinError || undefined}
                hint={pinLoading ? "Looking up your location…" : undefined}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="City"
                  name="city"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  readOnly={pinLoading}
                />
                <Input
                  label="State"
                  name="state"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  readOnly={pinLoading}
                />
              </div>
            </Section>
            <Section title="Payment">
              <label className="flex items-start gap-3 border p-4 cursor-pointer">
                <input type="radio" defaultChecked name="pm" className="mt-1" />
                <div>
                  <div className="text-sm font-medium">Cash on Delivery</div>
                  <div className="text-xs text-muted-foreground">Pay when your order arrives. Online payments coming soon.</div>
                </div>
              </label>
            </Section>
          </div>
          <aside className="border p-5 sm:p-6 h-fit space-y-3 text-sm">
            <div className="text-xs uppercase tracking-[0.2em] mb-2">Order Summary</div>
            {cartItems.map((l) => (
              <div key={`${l.productId}|${l.size ?? ""}`} className="flex justify-between text-xs text-muted-foreground">
                <span className="truncate pr-2">{l.name} × {l.qty}</span>
                <span>{inr(l.price * l.qty)}</span>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{inr(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : inr(shipping)}</span></div>
            <div className="flex justify-between border-t pt-3 text-base font-semibold"><span>Total</span><span>{inr(total)}</span></div>
            <button disabled={submitting} type="submit" className="block w-full text-center bg-foreground text-background py-3 text-sm uppercase tracking-[0.2em] mt-4 hover:bg-[oklch(0.78_0.13_85)] hover:text-black transition disabled:opacity-60">{submitting ? "Placing order…" : "Place Order"}</button>
          </aside>
        </form>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border p-5 sm:p-6 space-y-3">
      <div className="text-xs uppercase tracking-[0.2em] mb-1">{title}</div>
      {children}
    </div>
  );
}
function Input({
  label,
  error,
  hint,
  ...props
}: { label: string; error?: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        {...props}
        className={`mt-1 w-full border px-3 py-2 bg-background focus:outline-none focus:border-foreground ${
          error ? "border-destructive" : ""
        }`}
      />
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
      {!error && hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}
