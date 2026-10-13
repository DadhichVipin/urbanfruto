import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowRight, Check, Droplet, FlaskConical, Plus, ShoppingBag, Snowflake, Star, Zap,
} from "lucide-react";
import { api, inr } from "@/lib/api";
import { useCart } from "@/store/CartContext";
import { toast } from "sonner";

export default function FruitDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { add, count, total: cartTotal } = useCart();

  const [fruits, setFruits] = useState([]);
  const [active, setActive] = useState(null);
  const [tab, setTab] = useState("fruit");
  const [variant, setVariant] = useState(1);

  useEffect(() => {
    api.get("/fruits").then((r) => setFruits(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!fruits.length) return;
    const q = (params.get("q") || "").toLowerCase();
    const found =
      fruits.find((f) => f.slug === slug) ||
      (q && fruits.find((f) => f.name.toLowerCase().includes(q))) ||
      fruits[0];
    setActive(found);
    setVariant(1);
    window.scrollTo({ top: 0 });
  }, [fruits, slug, params]);

  const addFruit = (fruit, qty = 1) => {
    add(
      {
        kind: "fruit", item_id: fruit.id, slug: fruit.slug, name: fruit.name,
        price: fruit.price, image: fruit.image, meta: `Custom bucket · ${fruit.unit}`,
      },
      qty
    );
    toast.success(`${fruit.name} × ${qty} added to your bucket`);
  };

  const addToBucket = () => {
    if (active) addFruit(active, variant);
  };

  const reviewBucket = () => {
    if (!count) {
      toast.error("Add at least one fruit to your bucket");
      return;
    }
    navigate("/checkout");
  };

  const quickBuy = () => {
    if (!active) return;
    addFruit(active, variant);
    navigate("/checkout");
  };

  if (!active)
    return <div className="uf-shell py-24 text-center text-sm text-[#6d8a63]" data-testid="fruit-loading">Loading orchard shelf…</div>;

  const variants = [
    { n: 1, label: `1 ${active.unit}`, note: `${inr(active.price)} · ${active.weight_grams}g` },
    { n: 2, label: `2 ${active.unit}`, note: `${inr(active.price * 2)} · ${(active.weight_grams * 2) / 1000}kg` },
    { n: 3, label: `3 ${active.unit}`, note: `${inr(active.price * 3 * 0.9)} · ${(active.weight_grams * 3) / 1000}kg`, best: true },
  ];

  return (
    <div data-testid="fruit-detail-page" className="bg-[#f7f7f8] pb-28 lg:pb-16">
      <div className="uf-shell pt-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.05fr_236px] lg:gap-8">
          {/* LEFT: info */}
          <div className="min-w-0">
            <h1 className="uf-display text-3xl font-black leading-[1.05] text-[#0f3d23] sm:text-4xl lg:text-5xl">
              {active.name}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-semibold text-[#e4601f]">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> {active.origin}</span>
              <span className="text-[#9bb392]">•</span>
              <span className="text-[#436a51]">{active.grammage}</span>
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#436a51] md:text-base">{active.description}</p>

            <div className="uf-card mt-5 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <b data-testid="fruit-price" className="uf-display text-2xl font-black text-[#0f3d23]">
                  {inr(active.price)} <span className="text-[12px] font-normal text-[#6d8a63]">/ {active.unit}</span>
                </b>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="uf-chip !px-2.5 !py-1 !text-[10.5px] !bg-[#ffe6d6] !border-[#ffd0b3] !text-[#c04d13]">
                    <FlaskConical className="h-3 w-3" /> Brix {active.brix}
                  </span>
                  <span className="uf-chip !px-2.5 !py-1 !text-[10.5px] !bg-[#eef0f2] !border-[#dcdfe4]">
                    <Zap className="h-3 w-3 text-[#2f7a46]" /> Free 3-Hr
                  </span>
                </div>
              </div>

              <div className="mt-3 flex gap-1.5 rounded-xl border border-[#e2e4e8] bg-white p-1">
                {variants.map((v) => (
                  <button
                    key={v.n}
                    data-testid={`fruit-variant-${v.n}`}
                    onClick={() => setVariant(v.n)}
                    className={`flex-1 rounded-lg px-2 py-1.5 text-center transition-colors ${
                      variant === v.n ? "bg-[#0f3d23] text-[#f3fbee]" : "text-[#436a51] hover:bg-[#f5f6f7]"
                    }`}
                  >
                    <b className="block whitespace-nowrap text-[11.5px] font-bold">{v.label}</b>
                    <span className={`block whitespace-nowrap text-[9px] ${variant === v.n ? "text-[#b7d7ac]" : "text-[#6d8a63]"}`}>
                      {v.note}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {[
                { icon: Droplet, t: "100% Ozone", s: "Washed & Pure" },
                { icon: Snowflake, t: "4°C Cold-Chain", s: "Farm to Door" },
                { icon: FlaskConical, t: `${active.brix} Brix`, s: "Lab Tested Sweet" },
              ].map(({ icon: Icon, t, s }) => (
                <div key={t} className="uf-card p-3 text-center">
                  <Icon className="mx-auto h-4 w-4 text-[#2f7a46]" />
                  <b className="mt-1.5 block text-[11px] leading-tight text-[#0f3d23]">{t}</b>
                  <span className="text-[9px] text-[#6d8a63]">{s}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <button data-testid="fruit-add-bucket" onClick={addToBucket} className="uf-btn-dark">
                <ShoppingBag className="h-4 w-4" /> Add to Bucket
              </button>
              <button data-testid="fruit-quick-buy" onClick={quickBuy} className="uf-btn-orange">
                <Zap className="h-4 w-4" /> Quick Buy
              </button>
            </div>
          </div>

          {/* CENTER: image + tabs */}
          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-2xl border border-[#e7e9ec] bg-[#ffffff] p-3">
              <img
                data-testid="fruit-hero-image"
                src={active.image}
                alt={active.name}
                className="h-[280px] w-full rounded-xl object-cover sm:h-[420px]"
              />
              <span className="absolute right-6 top-7 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold text-[#0f3d23]">
                • Freshly Plucked Today
              </span>
              <span className="absolute left-6 top-1/2 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold text-[#0f3d23]">
                • Ruby Antioxidant Flesh ({active.weight_grams}g)
              </span>
              <span className="absolute bottom-16 right-6 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold text-[#0f3d23]">
                100% Ozone Sanitized
              </span>
              <span className="absolute bottom-6 left-6 rounded-full bg-[#0f3d23]/90 px-3 py-1.5 text-[10px] font-bold text-[#e7f5e0]">
                ✓ Zero Wax Coating
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5 rounded-xl border border-[#e2e4e8] bg-white p-1.5">
              {[
                { id: "fruit", label: "Fruit View" },
                { id: "nutrition", label: "Nutrition Breakdown" },
                { id: "packaging", label: "Packaging & Storage" },
              ].map((t) => (
                <button
                  key={t.id}
                  data-testid={`fruit-tab-${t.id}`}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-[11.5px] font-semibold transition-colors ${
                    tab === t.id ? "bg-[#0f3d23] text-[#f3fbee]" : "text-[#436a51] hover:bg-[#f5f6f7]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "nutrition" && (
              <div data-testid="fruit-nutrition-panel" className="uf-card mt-3 grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
                {active.nutrition.map((n) => (
                  <div key={n.label} className="rounded-xl bg-[#f5f6f7] p-3 text-center">
                    <b className="uf-display block text-base font-bold text-[#0f3d23]">{n.value}</b>
                    <span className="text-[10px] text-[#6d8a63]">{n.label}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === "packaging" && (
              <p data-testid="fruit-packaging-panel" className="uf-card mt-3 p-4 text-[12.5px] leading-relaxed text-[#436a51]">
                {active.packaging}
              </p>
            )}
            {tab === "fruit" && (
              <div data-testid="fruit-tags-panel" className="mt-3 flex flex-wrap gap-2">
                {active.tags.map((t) => (
                  <span key={t} className="uf-chip">{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* HARVEST SHELF — side nav */}
          <aside className="uf-card min-w-0 p-4 lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:self-start lg:overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-[#e7e9ec] pb-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f5f6f7]">
                <Droplet className="h-4 w-4 text-[#2f7a46]" />
              </span>
              <span>
                <p className="uf-eyebrow text-[#e4601f]">Harvest Shelf</p>
                <h3 className="uf-display text-[15px] font-bold leading-tight text-[#0f3d23]">Explore Fruits</h3>
                <p className="text-[10px] text-[#6d8a63]">{fruits.length} Seasonal Varieties</p>
              </span>
            </div>

            <div className="uf-scroll-x mt-3 flex w-full min-w-0 max-w-full gap-3 overflow-x-auto lg:grid lg:gap-2 lg:overflow-visible">
              {fruits.map((f) => {
                const selected = f.slug === active.slug;
                return (
                  <div
                    key={f.id}
                    data-testid={`shelf-item-${f.slug}`}
                    className={`w-[180px] shrink-0 rounded-xl border p-2.5 transition-all lg:w-full ${
                      selected ? "border-[#0f3d23] bg-[#f5f6f7]" : "border-[#e7e9ec] bg-white hover:border-[#e2e4e8] hover:bg-[#fafafa]"
                    }`}
                  >
                    <Link to={`/fruits/${f.slug}`} className="flex items-center gap-2.5">
                      <img src={f.image} alt={f.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                      <span className="min-w-0 leading-tight">
                        <b className="block truncate text-[12px] font-bold text-[#0f3d23]">{f.short_name || f.name}</b>
                        <span className="block truncate text-[9.5px] text-[#6d8a63]">{f.origin}</span>
                        <span className="text-[10.5px] font-bold text-[#e4601f]">{inr(f.price)} / {f.unit}</span>
                      </span>
                    </Link>
                    <button
                      data-testid={`shelf-add-${f.slug}`}
                      onClick={() => addFruit(f, 1)}
                      className={`mt-2 w-full rounded-lg py-1.5 text-[11px] font-bold transition-colors ${
                        selected ? "bg-[#0f3d23] text-[#f3fbee]" : "border border-[#e2e4e8] text-[#0f3d23] hover:bg-[#f5f6f7]"
                      }`}
                    >
                      {selected ? "Selected · Add" : "+ Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>

        <div className="uf-card mt-6 p-5">
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-[#e4601f] text-[#e4601f]" />
            ))}
            <b className="text-[13px] text-[#0f3d23]">4.9 / 5.0</b>
            <span className="ml-auto text-[11px] font-semibold text-[#6d8a63]">Verified Harvest</span>
          </div>
          <p className="mt-3 text-[12.5px] italic leading-relaxed text-[#436a51]">
            "Delivered chilled in under 2 hours. Dragon fruit was massive and perfectly sweet, zero bruises! The cane
            hamper was a huge hit at my dinner party."
          </p>
          <p className="mt-3 text-[11px] font-semibold text-[#0f3d23]">
            Ananya S., Bandra West <span className="font-normal text-[#6d8a63]">· Verified Buyer</span>
          </p>
        </div>
      </div>

      {/* MOBILE STICKY */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center gap-3 border-t border-[#e7e9ec] bg-[#ffffff] px-4 py-3 lg:hidden">
        <div className="leading-tight">
          <span className="block text-[9.5px] font-semibold uppercase text-[#6d8a63]">
            Bucket total ({count} items)
          </span>
          <b data-testid="mobile-bucket-total" className="uf-display text-lg font-bold text-[#0f3d23]">{inr(cartTotal)}</b>
        </div>
        <button data-testid="mobile-bucket-add" onClick={addToBucket} className="uf-btn-ghost ml-auto !px-4 !py-2.5">
          <Plus className="h-4 w-4" />
        </button>
        <button data-testid="mobile-bucket-review" onClick={reviewBucket} className="uf-btn-orange !px-4 !py-2.5">
          Review Bucket <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
