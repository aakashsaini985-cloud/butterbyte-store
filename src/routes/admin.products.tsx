import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  adminListProducts,
  adminSaveProduct,
  adminDeleteProduct,
  adminListCategories,
  adminAddProductImage,
  adminDeleteProductImage,
} from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";
import { Pencil, Trash2, Plus, X, Upload, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  component: ProductsAdmin,
});

type Product = any;

function ProductsAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListProducts);
  const catsFn = useServerFn(adminListCategories);
  const saveFn = useServerFn(adminSaveProduct);
  const delFn = useServerFn(adminDeleteProduct);

  const { data: products = [] } = useQuery({ queryKey: ["admin-products"], queryFn: () => listFn() });
  const { data: cats = [] } = useQuery({ queryKey: ["admin-categories"], queryFn: () => catsFn() });

  const [editing, setEditing] = useState<Product | null>(null);
  const [query, setQuery] = useState("");

  const filtered = products.filter((p: any) =>
    !query || p.name.toLowerCase().includes(query.toLowerCase()) || (p.sku ?? "").toLowerCase().includes(query.toLowerCase()),
  );

  const onDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await delFn({ data: { id } });
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} total</p>
        </div>
        <button
          onClick={() => setEditing({})}
          className="bg-foreground text-background px-4 py-2 text-sm inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> New product
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products by name or SKU…"
        className="w-full md:w-80 border px-3 py-2 mb-4 bg-background text-sm"
      />

      <div className="bg-background border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                        {p.product_images?.[0]?.url ? (
                          <img src={p.product_images[0].url} alt="" className="w-full h-full object-cover" />
                        ) : <ImageIcon className="w-full h-full p-2 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate max-w-[200px]">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.sku ?? "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{p.categories?.name ?? "—"}</td>
                  <td className="p-3">{inr(Number(p.selling_price))}</td>
                  <td className="p-3">{p.stock_qty}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${p.is_active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
                      {p.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditing(p)} className="p-2 hover:bg-muted rounded" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => onDelete(p.id)} className="p-2 hover:bg-muted rounded text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <ProductEditor
          initial={editing}
          categories={cats}
          onClose={() => setEditing(null)}
          onSave={async (payload) => {
            try {
              await saveFn({ data: payload });
              toast.success("Saved");
              setEditing(null);
              qc.invalidateQueries({ queryKey: ["admin-products"] });
            } catch (e: any) { toast.error(e.message); }
          }}
        />
      )}
    </div>
  );
}

function ProductEditor({ initial, categories, onClose, onSave }: { initial: any; categories: any[]; onClose: () => void; onSave: (p: any) => void }) {
  const qc = useQueryClient();
  const addImg = useServerFn(adminAddProductImage);
  const delImg = useServerFn(adminDeleteProductImage);

  const [form, setForm] = useState({
    id: initial.id,
    name: initial.name ?? "",
    slug: initial.slug ?? "",
    brand: initial.brand ?? "BUTTERBYTE STORE",
    description: initial.description ?? "",
    sku: initial.sku ?? "",
    category_id: initial.category_id ?? null,
    mrp: Number(initial.mrp ?? 0),
    selling_price: Number(initial.selling_price ?? 0),
    discount_pct: initial.discount_pct ?? 0,
    stock_qty: initial.stock_qty ?? 0,
    availability: initial.availability ?? "In Stock",
    is_new: initial.is_new ?? false,
    is_bestseller: initial.is_bestseller ?? false,
    is_trending: initial.is_trending ?? false,
    is_active: initial.is_active ?? true,
  });
  const [uploading, setUploading] = useState(false);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleUpload = async (files: FileList | null) => {
    if (!files || !files.length || !initial.id) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${initial.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) throw error;
        const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
        await addImg({ data: { product_id: initial.id, url: pub.publicUrl, sort_order: 0 } });
      }
      toast.success("Image(s) uploaded");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      await delImg({ data: { id } });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Image removed");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-6 overflow-y-auto">
      <div className="bg-background w-full md:max-w-3xl rounded-t-lg md:rounded-lg max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-xl">{initial.id ? "Edit product" : "New product"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v, slug: form.slug || slugify(v) })} />
            <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: slugify(v) })} />
            <Field label="Brand" value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} />
            <Field label="SKU" value={form.sku ?? ""} onChange={(v) => setForm({ ...form, sku: v })} />
            <div>
              <Label>Category</Label>
              <select
                value={form.category_id ?? ""}
                onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}
                className="w-full border px-3 py-2 bg-background text-sm"
              >
                <option value="">— None —</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.gender})</option>)}
              </select>
            </div>
            <Field label="Availability" value={form.availability} onChange={(v) => setForm({ ...form, availability: v })} />
            <Field label="MRP (₹)" type="number" value={String(form.mrp)} onChange={(v) => setForm({ ...form, mrp: Number(v) })} />
            <Field label="Selling Price (₹)" type="number" value={String(form.selling_price)} onChange={(v) => setForm({ ...form, selling_price: Number(v) })} />
            <Field label="Discount %" type="number" value={String(form.discount_pct)} onChange={(v) => setForm({ ...form, discount_pct: Number(v) })} />
            <Field label="Stock Qty" type="number" value={String(form.stock_qty)} onChange={(v) => setForm({ ...form, stock_qty: Number(v) })} />
          </div>

          <div>
            <Label>Description</Label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full border px-3 py-2 bg-background text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <Toggle label="Active (visible)" checked={form.is_active} onChange={(v) => setForm({ ...form, is_active: v })} />
            <Toggle label="New" checked={form.is_new} onChange={(v) => setForm({ ...form, is_new: v })} />
            <Toggle label="Bestseller" checked={form.is_bestseller} onChange={(v) => setForm({ ...form, is_bestseller: v })} />
            <Toggle label="Trending" checked={form.is_trending} onChange={(v) => setForm({ ...form, is_trending: v })} />
          </div>

          {initial.id && (
            <div>
              <Label>Images</Label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-3">
                {(initial.product_images ?? []).map((img: any) => (
                  <div key={img.id} className="relative group aspect-square bg-muted rounded overflow-hidden">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded opacity-0 group-hover:opacity-100"
                    ><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
              <label className="inline-flex items-center gap-2 border px-4 py-2 text-sm cursor-pointer hover:bg-muted">
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading…" : "Upload images"}
                <input type="file" multiple accept="image/*" hidden onChange={(e) => handleUpload(e.target.files)} disabled={uploading} />
              </label>
            </div>
          )}

          {!initial.id && (
            <p className="text-xs text-muted-foreground">Save the product first, then upload images.</p>
          )}
        </div>
        <div className="sticky bottom-0 bg-background border-t px-6 py-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border">Cancel</button>
          <button onClick={() => onSave(form)} className="px-4 py-2 text-sm bg-foreground text-background">Save</button>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{children}</div>;
}
function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border px-3 py-2 bg-background text-sm" />
    </div>
  );
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
