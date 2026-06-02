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
        payment_method: z.string().max(50).default("cod"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Server-authoritative pricing — never trust client-supplied prices.
    // Every item must reference a real product; fetch the current selling_price
    // from the database and recompute subtotal, shipping, and total here.
    const productIds = Array.from(
      new Set(data.items.map((i) => i.product_id).filter((v): v is string => !!v)),
    );
    if (productIds.length === 0) throw new Error("Invalid cart: missing product references");

    const { data: dbProducts, error: prodErr } = await supabase
      .from("products")
      .select("id, name, selling_price")
      .in("id", productIds);
    if (prodErr) throw new Error(prodErr.message);

    const priceMap = new Map((dbProducts ?? []).map((p) => [p.id, p]));

    const pricedItems = data.items.map((it) => {
      if (!it.product_id) throw new Error(`Invalid cart item: ${it.name}`);
      const p = priceMap.get(it.product_id);
      if (!p) throw new Error(`Product no longer available: ${it.name}`);
      const unitPrice = Number(p.selling_price);
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new Error(`Invalid price for product: ${p.name}`);
      }
      return {
        product_id: it.product_id,
        name: p.name,
        sku: it.sku ?? null,
        price: unitPrice,
        qty: it.qty,
        image_url: it.image_url ?? null,
      };
    });

    const subtotal = pricedItems.reduce((s, l) => s + l.price * l.qty, 0);
    const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79;
    const total = subtotal + shipping;

    const order_no = "BB" + Date.now().toString().slice(-8);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        order_no,
        subtotal,
        discount: 0,
        shipping,
        total,
        status: "pending",
        payment_method: data.payment_method,
        address_snapshot: data.address,
      })
      .select("id, order_no")
      .single();
    if (error || !order) throw new Error(error?.message || "Failed to create order");

    const { error: itemsErr } = await supabase.from("order_items").insert(
      pricedItems.map((it) => ({ order_id: order.id, ...it })),
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

    // Return only minimum required fields — do NOT expose full address_snapshot
    // (name, phone, address lines) to unauthenticated callers.
    const city = typeof snap.city === "string" ? snap.city : "";
    const state = typeof snap.state === "string" ? snap.state : "";
    const safeOrder = {
      order_no: order.order_no,
      status: order.status,
      created_at: order.created_at,
      total: order.total,
      subtotal: order.subtotal,
      shipping: order.shipping,
      ship_to: [city, state].filter(Boolean).join(", "),
    };

    return { order: safeOrder, items: items ?? [] };
  });
