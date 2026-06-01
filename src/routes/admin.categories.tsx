import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { adminListCategories, adminSaveCategory, adminDeleteCategory } from "@/lib/admin.functions";
import { Pencil, Trash2, Plus, X } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesAdmin,
});

function CategoriesAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListCategories);
  const saveFn = useServerFn(adminSaveCategory);
  const delFn = useServerFn(adminDeleteCategory);
  const { data: cats = [] } = useQuery({ queryKey: ["admin-categories"], queryFn: () => listFn() });
  const [editing, setEditing] = useState<any | null>(null);

  const onDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await delFn({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Categories</h1>
        <button onClick={() => setEditing({})} className="bg-foreground text-background px-4 py-2 text-sm inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> New category
        </button>
      </div>

      <div className="bg-background border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3">Gender</th><th className="p-3">Order</th><th></th></tr>
          </thead>
          <tbody>
            {cats.map((c: any) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-muted-foreground">{c.slug}</td>
                <td className="p-3 capitalize">{c.gender}</td>
                <td className="p-3">{c.sort_order}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(c)} className="p-2 hover:bg-muted rounded"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => onDelete(c.id)} className="p-2 hover:bg-muted rounded text-red-600"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <CategoryEditor
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={async (payload) => {
            try {
              await saveFn({ data: payload });
              toast.success("Saved");
              setEditing(null);
              qc.invalidateQueries({ queryKey: ["admin-categories"] });
            } catch (e: any) { toast.error(e.message); }
          }}
        />
      )}
    </div>
  );
}

function CategoryEditor({ initial, onClose, onSave }: { initial: any; onClose: () => void; onSave: (p: any) => void }) {
  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const [form, setForm] = useState({
    id: initial.id,
    name: initial.name ?? "",
    slug: initial.slug ?? "",
    gender: initial.gender ?? "women",
    image_url: initial.image_url ?? "",
    sort_order: initial.sort_order ?? 0,
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="bg-background w-full md:max-w-lg rounded-t-lg md:rounded-lg">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-xl">{initial.id ? "Edit category" : "New category"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v, slug: form.slug || slugify(v) })} />
          <Input label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: slugify(v) })} />
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Gender</div>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full border px-3 py-2 bg-background text-sm">
              <option value="women">Women</option><option value="men">Men</option><option value="unisex">Unisex</option>
            </select>
          </div>
          <Input label="Image URL (optional)" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} />
          <Input label="Sort order" type="number" value={String(form.sort_order)} onChange={(v) => setForm({ ...form, sort_order: Number(v) })} />
        </div>
        <div className="border-t px-6 py-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border">Cancel</button>
          <button onClick={() => onSave({ ...form, image_url: form.image_url || null })} className="px-4 py-2 text-sm bg-foreground text-background">Save</button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border px-3 py-2 bg-background text-sm" />
    </label>
  );
}
