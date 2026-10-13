import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { api, inr } from "@/lib/api";
import { toast } from "sonner";
import { GalleryUpload, ImageUpload } from "@/components/admin/ImageUpload";

const HAMPER_BLANK = {
  name: "", tagline: "", description: "", badge: "", price: 0, compare_price: 0, weight: "", vessel: "",
  image: "", curation: "exotic", contents: [], produce: [], varieties: 0, rating: 4.8, reviews: 0,
  stock: 10, featured: false, popular: false, active: true, gallery: [],
};

const FRUIT_BLANK = {
  name: "", short_name: "", origin: "", grammage: "", description: "", price: 0, unit: "pc", image: "",
  brix: "", weight_grams: 300, tags: [], nutrition: [], packaging: "", stock: 20, active: true,
};

const Field = ({ label, children }) => (
  <label className="block">
    <span className="text-[11px] font-semibold text-[#436a51]">{label}</span>
    {children}
  </label>
);

const inputCls = "mt-1 w-full rounded-lg border border-[#e2e4e8] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#0f3d23]";

export default function Inventory() {
  const [tab, setTab] = useState("hampers");
  const [hampers, setHampers] = useState([]);
  const [fruits, setFruits] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const [h, f] = await Promise.all([api.get("/admin/hampers"), api.get("/admin/fruits")]);
    setHampers(h.data);
    setFruits(f.data);
  };

  useEffect(() => { load().catch(() => toast.error("Could not load inventory")); }, []);

  const save = async (e) => {
    e.preventDefault();
    const path = tab === "hampers" ? "hampers" : "fruits";
    const body = { ...editing };
    body.price = Number(body.price);
    body.stock = Number(body.stock);
    if (tab === "hampers") {
      body.compare_price = Number(body.compare_price) || null;
      body.varieties = Number(body.varieties);
      body.reviews = Number(body.reviews);
      body.rating = Number(body.rating);
      if (typeof body.contents === "string") body.contents = body.contents.split("\n").filter(Boolean);
      if (!body.gallery?.length) body.gallery = body.image ? [body.image] : [];
    } else {
      body.weight_grams = Number(body.weight_grams);
      if (typeof body.tags === "string") body.tags = body.tags.split(",").map((s) => s.trim()).filter(Boolean);
    }
    try {
      if (body.id) await api.put(`/admin/${path}/${body.id}`, body);
      else await api.post(`/admin/${path}`, body);
      toast.success("Saved");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail?.[0]?.msg || "Save failed");
    }
  };

  const remove = async (id) => {
    const path = tab === "hampers" ? "hampers" : "fruits";
    await api.delete(`/admin/${path}/${id}`);
    toast.success("Deleted");
    load();
  };

  const rows = tab === "hampers" ? hampers : fruits;

  return (
    <div data-testid="admin-inventory">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="uf-display text-3xl font-bold text-[#0f3d23]">Inventory</h1>
          <p className="mt-1.5 text-[13px] text-[#6d8a63]">Manage hampers and individual orchard fruits.</p>
        </div>
        <button
          data-testid="inventory-add-btn"
          onClick={() => setEditing(tab === "hampers" ? { ...HAMPER_BLANK } : { ...FRUIT_BLANK })}
          className="uf-btn-orange"
        >
          <Plus className="h-4 w-4" /> Add {tab === "hampers" ? "Hamper" : "Fruit"}
        </button>
      </div>

      <div className="mt-5 flex gap-2">
        {["hampers", "fruits"].map((t) => (
          <button
            key={t}
            data-testid={`inventory-tab-${t}`}
            onClick={() => { setTab(t); setEditing(null); }}
            className={`rounded-full px-4 py-2 text-[12.5px] font-semibold capitalize ${
              tab === t ? "bg-[#0f3d23] text-[#f3fbee]" : "border border-[#e2e4e8] bg-white text-[#436a51]"
            }`}
          >
            {t} ({t === "hampers" ? hampers.length : fruits.length})
          </button>
        ))}
      </div>

      <div className="uf-card mt-5 overflow-x-auto p-4">
        <table className="w-full min-w-[700px] text-left text-[12.5px]">
          <thead className="text-[10.5px] uppercase tracking-wide text-[#6d8a63]">
            <tr>
              <th className="pb-2">Item</th><th className="pb-2">Price</th><th className="pb-2">Stock</th>
              <th className="pb-2">{tab === "hampers" ? "Curation" : "Unit"}</th><th className="pb-2">Active</th><th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} data-testid={`inventory-row-${r.slug}`} className="border-t border-[#eef0f2]">
                <td className="py-2.5">
                  <span className="flex items-center gap-2.5">
                    {r.image && <img src={r.image} alt={r.name} className="h-9 w-9 rounded-lg object-cover" />}
                    <span>
                      <b className="block text-[13px] text-[#0f3d23]">{r.name}</b>
                      <span className="text-[10.5px] text-[#6d8a63]">{r.slug}</span>
                    </span>
                  </span>
                </td>
                <td className="py-2.5 font-semibold text-[#e4601f]">{inr(r.price)}</td>
                <td className="py-2.5">
                  <span className={r.stock < 6 ? "font-bold text-[#c04d13]" : ""}>{r.stock}</span>
                </td>
                <td className="py-2.5 capitalize">{tab === "hampers" ? r.curation : r.unit}</td>
                <td className="py-2.5">{r.active ? "Yes" : "No"}</td>
                <td className="py-2.5">
                  <span className="flex justify-end gap-2">
                    <button
                      data-testid={`inventory-edit-${r.slug}`}
                      onClick={() => setEditing({ ...r, contents: (r.contents || []).join("\n"), tags: (r.tags || []).join(", ") })}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-[#e2e4e8] bg-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      data-testid={`inventory-delete-${r.slug}`}
                      onClick={() => remove(r.id)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-[#f0cfc4] bg-white text-[#c04d13]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-[#6d8a63]">Nothing here yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0f3d23]/50 p-4 backdrop-blur-sm" data-testid="inventory-modal">
          <form onSubmit={save} className="my-8 w-full max-w-[640px] rounded-2xl bg-[#ffffff] p-5">
            <div className="flex items-center justify-between">
              <h2 className="uf-display text-xl font-bold">
                {editing.id ? "Edit" : "New"} {tab === "hampers" ? "Hamper" : "Fruit"}
              </h2>
              <button type="button" data-testid="inventory-modal-close" onClick={() => setEditing(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Name *">
                <input data-testid="form-name" required className={inputCls} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </Field>
              <Field label="Main Image">
                <ImageUpload folder={tab} value={editing.image} onChange={(url) => setEditing((cur) => ({ ...cur, image: url }))} />
              </Field>
              <Field label="Price (₹) *">
                <input data-testid="form-price" required type="number" className={inputCls} value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} />
              </Field>
              <Field label="Stock">
                <input data-testid="form-stock" type="number" className={inputCls} value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} />
              </Field>

              {tab === "hampers" ? (
                <>
                  <Field label="Compare Price (₹)">
                    <input type="number" className={inputCls} value={editing.compare_price || ""} onChange={(e) => setEditing({ ...editing, compare_price: e.target.value })} />
                  </Field>
                  <Field label="Weight">
                    <input className={inputCls} value={editing.weight} onChange={(e) => setEditing({ ...editing, weight: e.target.value })} />
                  </Field>
                  <Field label="Vessel">
                    <input className={inputCls} value={editing.vessel} onChange={(e) => setEditing({ ...editing, vessel: e.target.value })} />
                  </Field>
                  <Field label="Badge">
                    <input className={inputCls} value={editing.badge} onChange={(e) => setEditing({ ...editing, badge: e.target.value })} />
                  </Field>
                  <Field label="Curation">
                    <select data-testid="form-curation" className={inputCls} value={editing.curation} onChange={(e) => setEditing({ ...editing, curation: e.target.value })}>
                      {["exotic", "wellness", "corporate"].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Varieties">
                    <input type="number" className={inputCls} value={editing.varieties} onChange={(e) => setEditing({ ...editing, varieties: e.target.value })} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Gallery (main image is used if empty)">
                      <GalleryUpload
                        folder="hampers"
                        value={editing.gallery || []}
                        onChange={(next) => setEditing((cur) => ({ ...cur, gallery: typeof next === "function" ? next(cur.gallery || []) : next }))}
                      />
                    </Field>
                  </div>
                  <Field label="Contents (one per line)">
                    <textarea rows={3} className={`${inputCls} sm:col-span-2`} value={editing.contents} onChange={(e) => setEditing({ ...editing, contents: e.target.value })} />
                  </Field>
                  <Field label="Description">
                    <textarea rows={3} className={inputCls} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Short Name">
                    <input className={inputCls} value={editing.short_name} onChange={(e) => setEditing({ ...editing, short_name: e.target.value })} />
                  </Field>
                  <Field label="Origin">
                    <input className={inputCls} value={editing.origin} onChange={(e) => setEditing({ ...editing, origin: e.target.value })} />
                  </Field>
                  <Field label="Unit (pc / 250g)">
                    <input className={inputCls} value={editing.unit} onChange={(e) => setEditing({ ...editing, unit: e.target.value })} />
                  </Field>
                  <Field label="Grammage label">
                    <input className={inputCls} value={editing.grammage} onChange={(e) => setEditing({ ...editing, grammage: e.target.value })} />
                  </Field>
                  <Field label="Weight (grams)">
                    <input type="number" className={inputCls} value={editing.weight_grams} onChange={(e) => setEditing({ ...editing, weight_grams: e.target.value })} />
                  </Field>
                  <Field label="Brix">
                    <input className={inputCls} value={editing.brix} onChange={(e) => setEditing({ ...editing, brix: e.target.value })} />
                  </Field>
                  <Field label="Tags (comma separated)">
                    <input className={inputCls} value={editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} />
                  </Field>
                  <Field label="Description">
                    <textarea rows={3} className={inputCls} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                  </Field>
                  <Field label="Packaging & Storage">
                    <textarea rows={2} className={inputCls} value={editing.packaging} onChange={(e) => setEditing({ ...editing, packaging: e.target.value })} />
                  </Field>
                </>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-5 text-[12.5px]">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Active
              </label>
              {tab === "hampers" && (
                <>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> Featured
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!editing.popular} onChange={(e) => setEditing({ ...editing, popular: e.target.checked })} /> Most Popular
                  </label>
                </>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button data-testid="inventory-save-btn" className="uf-btn-dark flex-1">Save</button>
              <button type="button" onClick={() => setEditing(null)} className="uf-btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
