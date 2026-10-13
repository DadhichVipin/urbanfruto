import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowUpDown, Building2, Droplet, Gift, Leaf, Snowflake, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { useCart } from "@/store/CartContext";
import { HamperCard } from "@/components/site/HamperCard";
import { toast } from "sonner";

const ICONS = { droplet: Droplet, zap: Zap, snowflake: Snowflake, gift: Gift, leaf: Leaf };

const FILTERS = [
  { id: "all", label: "All Curations" },
  { id: "exotic", label: "Exotic Imports" },
  { id: "wellness", label: "Wellness Trio" },
  { id: "corporate", label: "Corporate" },
];

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "weight-asc", label: "Weight: Light to Heavy" },
  { id: "weight-desc", label: "Weight: Heavy to Light" },
];

const kg = (w) => parseFloat(String(w || "").replace(/[^0-9.]/g, "")) || 0;

export default function Baskets() {
  const [hampers, setHampers] = useState([]);
  const [promises, setPromises] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("featured");
  const [params] = useSearchParams();
  const { add, setOpen } = useCart();

  useEffect(() => {
    window.scrollTo({ top: 0 });
    api.get("/hampers").then((r) => setHampers(r.data)).catch(() => {});
    api.get("/content").then((r) => setPromises(r.data.promises || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (params.get("curation")) setFilter(params.get("curation"));
  }, [params]);

  const shown = useMemo(() => {
    const list = filter === "all" ? [...hampers] : hampers.filter((h) => h.curation === filter);
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "weight-asc") sorted.sort((a, b) => kg(a.weight) - kg(b.weight));
    if (sort === "weight-desc") sorted.sort((a, b) => kg(b.weight) - kg(a.weight));
    if (sort === "featured") sorted.sort((a, b) => Number(b.popular) - Number(a.popular));
    return sorted;
  }, [hampers, filter, sort]);

  const addToCart = (h) => {
    add({ kind: "hamper", item_id: h.id, slug: h.slug, name: h.name, price: h.price, image: h.image, meta: h.weight });
    toast.success(`${h.name} added to your bucket`);
  };

  return (
    <div data-testid="baskets-page" className="bg-[#eaf6e4]">
      <section className="uf-shell pt-10">
        <p className="uf-eyebrow text-[#6d8a63]">Signature Offerings</p>
        <h1 className="uf-display mt-3 text-3xl font-black leading-[1.05] text-[#0f3d23] sm:text-4xl lg:text-5xl">
          Curated Gourmet Baskets
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#436a51] md:text-base">
          Hand-sorted exotic fruits paired with bespoke gift packaging for wellness and prestige celebrations. Every
          basket is ozone washed, cold-chain sealed and dispatched within 3 hours.
        </p>

        <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="uf-scroll-x flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                data-testid={`filter-${f.id}`}
                onClick={() => setFilter(f.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  filter === f.id ? "bg-[#0f3d23] text-[#f3fbee]" : "border border-[#cfe3c6] bg-white text-[#436a51]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <label className="flex shrink-0 items-center gap-2 rounded-full border border-[#cfe3c6] bg-white px-3.5 py-2">
            <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-[#7e9b74]" />
            <span className="whitespace-nowrap text-[11px] font-semibold text-[#6d8a63]">Sort by</span>
            <select
              data-testid="baskets-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#0f3d23] outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>

        <p data-testid="baskets-count" className="mt-3 text-[11.5px] text-[#6d8a63]">
          Showing {shown.length} of {hampers.length} baskets
        </p>

        <div data-testid="hamper-grid" className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">          {shown.map((h) => (
            <HamperCard
              key={h.id}
              hamper={h}
              onAdd={addToCart}
              onOrder={(x) => { addToCart(x); setOpen(true); }}
            />
          ))}
        </div>
        {shown.length === 0 && (
          <p data-testid="no-hampers" className="mt-10 text-center text-sm text-[#6d8a63]">
            No baskets in this curation yet.
          </p>
        )}
      </section>

      <section className="uf-shell mt-14">
        <Link
          to="/gifting"
          data-testid="baskets-gifting-cta"
          className="relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-[#143f27] p-6 uf-noise sm:flex-row sm:items-center sm:p-8"
        >
          <span className="relative min-w-0 flex-1">
            <span className="uf-chip !border-[#2f6243] !bg-[#1c5134] !text-[#cfe6c4]">
              <Building2 className="h-3.5 w-3.5" /> Corporate &amp; Bulk
            </span>
            <h2 className="uf-display mt-4 text-2xl font-bold leading-tight text-[#f3fbee] sm:text-3xl">
              Gifting 25+ hampers? Save up to 22%
            </h2>
            <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[#a8c99c]">
              Volume pricing, multi-address dispatch, co-branded cards and a formal GST quotation from our corporate
              desk.
            </p>
          </span>
          <span className="uf-btn-orange relative shrink-0">
            Request a Quote <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </section>

      <section className="mt-14 border-y border-[#d8e8d0] bg-[#ddefd4]">
        <div className="uf-shell grid grid-cols-2 gap-4 py-5 lg:grid-cols-4">
          {promises.map((p) => {
            const Icon = ICONS[p.icon] || Leaf;
            return (
              <div key={p.title} className="flex min-w-0 items-center gap-3">
                <Icon className="h-5 w-5 shrink-0 text-[#e4601f]" />
                <span className="min-w-0 leading-tight">
                  <b className="block truncate text-[13px] font-semibold text-[#0f3d23]">{p.title}</b>
                  <span className="block truncate text-[10px] text-[#5c7f52]">{p.note}</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
