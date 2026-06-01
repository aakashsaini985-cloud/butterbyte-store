import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetStats } from "@/lib/admin.functions";
import { Package, ShoppingCart, Tags, IndianRupee, Clock } from "lucide-react";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const fn = useServerFn(adminGetStats);
  const { data } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fn() });

  const cards = [
    { label: "Products", value: data?.productCount ?? "—", icon: Package },
    { label: "Categories", value: data?.categoryCount ?? "—", icon: Tags },
    { label: "Orders", value: data?.orderCount ?? "—", icon: ShoppingCart },
    { label: "Pending", value: data?.pendingCount ?? "—", icon: Clock },
    { label: "Revenue", value: data ? inr(data.revenue) : "—", icon: IndianRupee },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">Overview of your store.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-background border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2 text-muted-foreground">
              <span className="text-xs uppercase tracking-wider">{c.label}</span>
              <c.icon className="h-4 w-4" />
            </div>
            <div className="text-2xl font-semibold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-background border rounded-lg p-6">
        <h2 className="font-semibold mb-2">Quick start</h2>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Use <strong>Products</strong> to add, edit, price, enable/disable, and manage images.</li>
          <li>Use <strong>Categories</strong> to organize the catalog.</li>
          <li>Use <strong>Orders</strong> to view customer orders and update fulfillment status.</li>
        </ul>
      </div>
    </div>
  );
}
