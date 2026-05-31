// Public storefront data — uses anon client (RLS public read).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type ProductCard = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  selling_price: number;
  mrp: number;
  discount_pct: number;
  image_url: string | null;
  category_slug: string | null;
  category_name: string | null;
  rating_avg: number;
  rating_count: number;
  sizes: string[];
};

async function mapProducts(rows: any[]): Promise<ProductCard[]> {
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    brand: r.brand,
    selling_price: Number(r.selling_price),
    mrp: Number(r.mrp),
    discount_pct: r.discount_pct,
    image_url: r.product_images?.[0]?.url ?? null,
    category_slug: r.categories?.slug ?? null,
    category_name: r.categories?.name ?? null,
    rating_avg: Number(r.rating_avg),
    rating_count: r.rating_count,
    sizes: Array.from(
      new Set(
        ((r.product_variants ?? []) as Array<{ size: string | null; stock_qty: number }>)
          .filter((v) => v.size)
          .map((v) => v.size as string),
      ),
    ),
  }));
}

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [banners, newArr, best, trending, cats] = await Promise.all([
    sb.from("banners").select("*").eq("active", true).order("sort_order"),
    sb.from("products").select("*, product_images(url), categories(slug,name)").order("created_at", { ascending: false }).limit(8),
    sb.from("products").select("*, product_images(url), categories(slug,name)").eq("is_bestseller", true).limit(8),
    sb.from("products").select("*, product_images(url), categories(slug,name)").eq("is_trending", true).limit(8),
    sb.from("categories").select("*").order("sort_order"),
  ]);
  return {
    banners: banners.data ?? [],
    newArrivals: await mapProducts(newArr.data ?? []),
    bestSellers: await mapProducts(best.data ?? []),
    trending: await mapProducts(trending.data ?? []),
    categories: cats.data ?? [],
  };
});

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((d: {
    gender?: "men" | "women";
    categorySlug?: string;
    q?: string;
    sort?: "new" | "price_asc" | "price_desc" | "bestseller";
    minPrice?: number;
    maxPrice?: number;
    flag?: "new" | "bestseller" | "trending" | "sale";
    limit?: number;
  }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb.from("products").select("*, product_images(url), product_variants(size,stock_qty), categories(slug,name,gender)", { count: "exact" });
    if (data.categorySlug) {
      const { data: cat } = await sb.from("categories").select("id").eq("slug", data.categorySlug).maybeSingle();
      if (cat) q = q.eq("category_id", cat.id);
    } else if (data.gender) {
      const { data: cats } = await sb.from("categories").select("id").eq("gender", data.gender);
      const ids = (cats ?? []).map((c) => c.id);
      if (ids.length) q = q.in("category_id", ids);
    }
    if (data.q) q = q.ilike("name", `%${data.q}%`);
    if (data.minPrice != null) q = q.gte("selling_price", data.minPrice);
    if (data.maxPrice != null) q = q.lte("selling_price", data.maxPrice);
    if (data.flag === "new") q = q.eq("is_new", true);
    if (data.flag === "bestseller") q = q.eq("is_bestseller", true);
    if (data.flag === "trending") q = q.eq("is_trending", true);
    if (data.flag === "sale") q = q.gt("discount_pct", 0);
    switch (data.sort) {
      case "price_asc": q = q.order("selling_price", { ascending: true }); break;
      case "price_desc": q = q.order("selling_price", { ascending: false }); break;
      case "bestseller": q = q.order("is_bestseller", { ascending: false }).order("rating_count", { ascending: false }); break;
      default: q = q.order("created_at", { ascending: false });
    }
    q = q.limit(data.limit ?? 60);
    const { data: rows, count } = await q;
    return { products: await mapProducts(rows ?? []), total: count ?? 0 };
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: p } = await sb.from("products")
      .select("*, product_images(url, sort_order), categories(slug,name,gender), product_variants(id,size,color,stock_qty), reviews(id,author_name,rating,title,body,created_at)")
      .eq("slug", data.slug).maybeSingle();
    if (!p) return null;
    // sort images
    (p as any).product_images?.sort?.((a: any, b: any) => a.sort_order - b.sort_order);
    return p as any;
  });

export const searchProducts = createServerFn({ method: "GET" })
  .inputValidator((d: { q: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    if (!data.q || data.q.length < 2) return { products: [] as ProductCard[] };
    const { data: rows } = await sb.from("products")
      .select("*, product_images(url), categories(slug,name)")
      .or(`name.ilike.%${data.q}%,sku.ilike.%${data.q}%`)
      .limit(8);
    return { products: await mapProducts(rows ?? []) };
  });

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb.from("categories").select("*").order("sort_order");
  return data ?? [];
});
