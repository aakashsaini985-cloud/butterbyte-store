import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { getMyOrders } from "@/lib/orders.functions";
import { inr } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — BUTTERBYTE STORE" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", search: { redirect: "/account" } as any });
      return;
    }
    getMyOrders()
      .then((rows) => setOrders(rows))
      .catch((e) => toast.error(e.message))
      .finally(() => setOrdersLoading(false));
  }, [user, loading, navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Loading…</p></main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl">My Account</h1>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
          </div>
          <button onClick={signOut} className="text-xs uppercase tracking-[0.2em] border px-4 py-2 hover:bg-foreground hover:text-background transition">
            Sign out
          </button>
        </div>

        <section className="border p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase tracking-[0.2em]">Recent Orders</h2>
            <Link to="/track-order" className="text-xs underline">Track an order</Link>
          </div>
          {ordersLoading ? (
            <p className="text-sm text-muted-foreground">Loading orders…</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">You haven't placed any orders yet. <Link to="/shop" className="underline">Start shopping</Link>.</p>
          ) : (
            <ul className="divide-y">
              {orders.map((o) => (
                <li key={o.id} className="py-3 flex flex-wrap justify-between items-center gap-2 text-sm">
                  <div>
                    <div className="font-mono">{o.order_no}</div>
                    <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="text-xs uppercase tracking-wider px-2 py-1 border rounded">{o.status}</div>
                  <div className="font-semibold">{inr(Number(o.total))}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
