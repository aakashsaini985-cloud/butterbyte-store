import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const OrderItemSchema = z.object({
  product_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(255),
  sku: z.string().max(100).nullable().optional(),
  price: z.number().nonnegative(),
  qty: z.number().int().positive().max(99),
  image_url: z.string().max(2000).nullable().optional(),
});

const AddressSchema = z.object({
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  email: z.string().email().max(255),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  line1: z.string().min(3).max(255),
  line2: z.string().max(255).optional().nullable(),
  pincode: z.string().regex(/^\d{6}$/),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
});

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        items: z.array(OrderItemSchema).min(1).max(50),
        address: AddressSchema,
        subtotal: z.number().nonnegative(),
        shipping: z.number().nonnegative(),
        total: z.number().nonnegative(),
        payment_method: z.string().max(50).default("cod"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const order_no = "BB" + Date.now().toString().slice(-8);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        order_no,
        subtotal: data.subtotal,
        discount: 0,
        shipping: data.shipping,
        total: data.total,
        status: "pending",
        payment_method: data.payment_method,
        address_snapshot: data.address,
      })
      .select("id, order_no")
      .single();
    if (error || !order) throw new Error(error?.message || "Failed to create order");

    const { error: itemsErr } = await supabase.from("order_items").insert(
      data.items.map((it) => ({
        order_id: order.id,
        product_id: it.product_id ?? null,
        name: it.name,
        sku: it.sku ?? null,
        price: it.price,
        qty: it.qty,
        image_url: it.image_url ?? null,
      })),
    );
    if (itemsErr) throw new Error(itemsErr.message);

    return { order_no: order.order_no, id: order.id };
  });

export const getMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_no, total, status, created_at, address_snapshot")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const trackOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        order_no: z.string().min(4).max(40),
        contact: z.string().min(4).max(100), // email or 10-digit phone
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, order_no, total, status, created_at, address_snapshot, subtotal, shipping")
      .eq("order_no", data.order_no.trim())
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Order not found");

    const snap = (order.address_snapshot ?? {}) as Record<string, string>;
    const c = data.contact.trim().toLowerCase();
    const email = (snap.email ?? "").toLowerCase();
    const phone = snap.phone ?? "";
    if (c !== email && c !== phone) {
      throw new Error("Contact details don't match this order");
    }

    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("name, qty, price, image_url")
      .eq("order_id", order.id);

    return { order, items: items ?? [] };
  });
