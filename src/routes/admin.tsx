import { createFileRoute, Link, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/admin.functions";
import { LayoutDashboard, Package, Tags, ShoppingCart, LogOut, Store } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · BUTTERBYTE STORE" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/login", search: { redirect: "/admin" } as any });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const router = useRouter();
  const check = useServerFn(checkIsAdmin);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-check"],
    queryFn: () => check(),
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (data && !data.isAdmin) router.navigate({ to: "/" });
  }, [data, router]);

  if (isLoading) return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Loading admin…</div>;
  if (isError || !data?.isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Access denied</h1>
          <p className="text-sm text-muted-foreground mb-4">Your account doesn't have admin privileges.</p>
          <Link to="/" className="underline text-sm">Back to store</Link>
        </div>
      </div>
    );
  }

  const nav = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/categories", label: "Categories", icon: Tags },
    { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className={`${mobileOpen ? "block" : "hidden"} md:block fixed md:sticky inset-0 md:inset-auto md:top-0 md:h-screen z-40 w-64 bg-background border-r p-4 flex-shrink-0`}>
        <div className="font-display text-xl mb-6">BUTTERBYTE Admin</div>
        <nav className="space-y-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.exact }}
              onClick={() => setMobileOpen(false)}
              activeProps={{ className: "bg-foreground text-background" }}
              className="flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-muted"
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t pt-4 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-muted">
            <Store className="h-4 w-4" /> View store
          </Link>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.navigate({ to: "/login" }); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-muted text-left"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="md:hidden sticky top-0 z-30 bg-background border-b px-4 py-3 flex items-center justify-between">
          <button onClick={() => setMobileOpen((v) => !v)} className="text-sm font-medium">☰ Menu</button>
          <div className="font-display">Admin</div>
        </div>
        <main className="p-4 md:p-8 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
