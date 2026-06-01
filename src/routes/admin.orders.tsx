import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { adminListOrders, adminUpdateOrderStatus } from "@/lib/admin.functions";
import { inr } from "@/lib/format";
import { ChevronDown, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersAdmin,
});

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

function OrdersAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListOrders);
  const updateFn = useServerFn(adminUpdateOrderStatus);
  const { data: orders = [] } = useQuery({ queryKey: ["admin-orders"], queryFn: () => listFn() });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const visible = orders.filter((o: any) => filter === "all" || o.status === filter);

  const updateStatus = async (id: string, status: any) => {
    try {
      await updateFn({ data: { id, status } });
      toast.success("Order updated");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Orders</h1>
      <p className="text-sm text-muted-foreground mb-6">{orders.length} total</p>

      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 text-xs uppercase tracking-wider border ${filter === s ? "bg-foreground text-background" : ""}`}
          >{s}</button>
        ))}
      </div>

      <div className="bg-background border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3"></th>
                <th className="p-3">Order #</th>
                <th className="p-3">Date</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((o: any) => {
                const addr = o.address_snapshot ?? {};
                const open = expanded === o.id;
                return (
                  <>
                    <tr key={o.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => setExpanded(open ? null : o.id)}>
                      <td className="p-3">{open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</td>
                      <td className="p-3 font-mono text-xs">{o.order_no}</td>
                      <td className="p-3 text-muted-foreground text-xs">{new Date(o.created_at).toLocaleString()}</td>
                      <td className="p-3">{addr.firstName} {addr.lastName}</td>
                      <td className="p-3">{inr(Number(o.total))}</td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={o.status}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          className="border px-2 py-1 text-xs bg-background"
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                    {open && (
                      <tr className="border-t bg-muted/20">
                        <td colSpan={6} className="p-4">
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Shipping address</div>
                              <div>{addr.firstName} {addr.lastName}</div>
                              <div>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</div>
                              <div>{addr.city}, {addr.state} {addr.pincode}</div>
                              <div>📞 {addr.phone}</div>
                              <div>✉️ {addr.email}</div>
                              <div className="mt-2 text-xs text-muted-foreground">Payment: {o.payment_method}</div>
                            </div>
                            <div>
                              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Items</div>
                              <ul className="space-y-2">
                                {(o.order_items ?? []).map((it: any) => (
                                  <li key={it.id} className="flex items-center gap-3">
                                    {it.image_url && <img src={it.image_url} alt="" className="w-10 h-10 object-cover rounded" />}
                                    <div className="flex-1 min-w-0">
                                      <div className="truncate">{it.name}</div>
                                      <div className="text-xs text-muted-foreground">Qty {it.qty} · {inr(Number(it.price))}</div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                              <div className="mt-3 text-xs text-muted-foreground">
                                Subtotal {inr(Number(o.subtotal))} · Shipping {inr(Number(o.shipping))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {visible.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No orders.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
