import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Check, ChevronDown, Droplet, Gift, Leaf, Snowflake, Star, Zap, ShoppingBag, Minus, Plus,
} from "lucide-react";
import { api, inr } from "@/lib/api";
import { useCart } from "@/store/CartContext";
import { toast } from "sonner";

export default function HamperDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { add, setOpen } = useCart();
  const [hamper, setHamper] = useState(null);
  const [all, setAll] = useState([]);
  const [tab, setTab] = useState("front");
  const [qty, setQty] = useState(1);
  const [showPolicy, setShowPolicy] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setQty(1);
    api.get(`/hampers/${slug}`).then((r) => setHamper(r.data)).catch(() => setNotFound(true));
    api.get("/hampers").then((r) => setAll(r.data)).catch(() => {});
  }, [slug]);

  const discount = useMemo(() => {
    if (!hamper?.compare_price) return 0;
    return Math.round(((hamper.compare_price - hamper.price) / hamper.compare_price) * 100);
  }, [hamper]);

  if (notFound)
    return (
      <div className="uf-shell py-24 text-center" data-testid="hamper-not-found">
        <h1 className="uf-display text-2xl font-bold">Hamper not found</h1>
        <Link to="/baskets" className="uf-btn-dark mt-6">Back to Baskets</Link>      </div>
    );

  if (!hamper)
    return <div className="uf-shell py-24 text-center text-sm text-[#6d8a63]" data-testid="hamper-loading">Loading hamper…</div>;

  const addToCart = () => {
    add({ kind: "hamper", item_id: hamper.id, slug: hamper.slug, name: hamper.name, price: hamper.price, image: hamper.image, meta: hamper.weight }, qty);
    toast.success(`${hamper.name} × ${qty} added`);
  };

  const gallery = hamper.gallery?.length ? hamper.gallery : [hamper.image];

  return (
    <div data-testid="hamper-detail-page" className="bg-[#f7f7f8] pb-28 lg:pb-16">
      <div className="uf-shell pt-6">
        <div className="uf-scroll-x flex gap-2 overflow-x-auto pb-4">
          {[
            { label: "Baskets", to: "/baskets" },
            { label: "Fruits (Custom)", to: "/fruits" },
            { label: "Home", to: "/" },
          ].map((t, i) => (
            <Link
              key={t.label}
              to={t.to}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${
                i === 0 ? "bg-[#0f3d23] text-[#f3fbee]" : "border border-[#e2e4e8] bg-white text-[#436a51]"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.05fr_236px] lg:gap-8">
          {/* LEFT */}
          <div className="min-w-0">
            <h1 className="uf-display text-3xl font-black leading-[1.05] text-[#0f3d23] sm:text-4xl lg:text-5xl">
              {hamper.name}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-semibold text-[#e4601f]">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> {hamper.vessel}</span>
              <span className="text-[#9bb392]">•</span>
              <span className="text-[#436a51]">{hamper.weight}</span>
              <span className="text-[#9bb392]">•</span>
              <span className="flex items-center gap-1.5 text-[#0f3d23]">
                <Star className="h-3.5 w-3.5 fill-[#e4601f] text-[#e4601f]" /> {hamper.rating}
                <span className="font-normal text-[#6d8a63]">({hamper.reviews})</span>
              </span>
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#436a51] md:text-base">{hamper.description}</p>

            <div className="uf-card mt-5 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <span className="flex flex-wrap items-baseline gap-2">
                  <b data-testid="hamper-price" className="uf-display text-2xl font-black text-[#0f3d23]">{inr(hamper.price)}</b>
                  {hamper.compare_price && <s className="text-[12px] text-[#9bb392]">{inr(hamper.compare_price)}</s>}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {discount > 0 && (
                    <span className="uf-chip !px-2.5 !py-1 !text-[10.5px] !bg-[#ffe6d6] !border-[#ffd0b3] !text-[#c04d13]">
                      {discount}% OFF
                    </span>
                  )}
                  <span className="uf-chip !px-2.5 !py-1 !text-[10.5px] !bg-[#eef0f2] !border-[#dcdfe4]">
                    <Zap className="h-3 w-3 text-[#2f7a46]" /> Free 3-Hr
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-[#e2e4e8] bg-white px-3 py-2">
                  <button data-testid="hamper-qty-dec" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <span data-testid="hamper-qty" className="w-6 text-center text-[13px] font-bold">{qty}</span>
                  <button data-testid="hamper-qty-inc" onClick={() => setQty((q) => q + 1)}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-[11px] text-[#6d8a63]">
                  {hamper.stock > 5 ? `${hamper.stock} baskets in stock` : `Only ${hamper.stock} left`}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {[
                { icon: Droplet, t: "100% Ozone", s: "Washed & Pure" },
                { icon: Snowflake, t: "4°C Cold-Chain", s: "Orchard to Door" },
                { icon: Gift, t: "Surprise Treat", s: "Honey Dipper" },
              ].map(({ icon: Icon, t, s }) => (
                <div key={t} className="uf-card p-3 text-center">
                  <Icon className="mx-auto h-4 w-4 text-[#2f7a46]" />
                  <b className="mt-1.5 block text-[11px] leading-tight text-[#0f3d23]">{t}</b>
                  <span className="text-[9px] text-[#6d8a63]">{s}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <button data-testid="hamper-add-cart" onClick={addToCart} className="uf-btn-dark">
                <ShoppingBag className="h-4 w-4" /> Add to Bucket
              </button>
              <button
                data-testid="hamper-express-buy"
                onClick={() => { addToCart(); navigate("/checkout"); }}
                className="uf-btn-orange"
              >
                <Zap className="h-4 w-4" /> Express Buy
              </button>
            </div>
          </div>

          {/* CENTER: image + tabs */}
          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-2xl border border-[#e7e9ec] bg-[#ffffff] p-3">
              <img
                data-testid="hamper-hero-image"
                src={tab === "inside" ? gallery[1] || gallery[0] : gallery[0]}
                alt={hamper.name}
                className="h-[280px] w-full rounded-xl object-cover sm:h-[420px]"
              />
              <span className="absolute right-6 top-7 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold text-[#0f3d23]">
                • Plucked This Morning
              </span>
              {hamper.produce?.[0] && (
                <span className="absolute left-6 top-1/2 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold text-[#0f3d23]">
                  • {hamper.produce[0].name} ({hamper.produce[0].qty})
                </span>
              )}
              <span className="absolute bottom-16 right-6 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold text-[#0f3d23]">
                {hamper.varieties} Artisanal Varieties
              </span>
              <span className="absolute bottom-6 left-6 rounded-full bg-[#0f3d23]/90 px-3 py-1.5 text-[10px] font-bold text-[#e7f5e0]">
                ✓ 4°C Cold Pack · {hamper.weight}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5 rounded-xl border border-[#e2e4e8] bg-white p-1.5">
              {[
                { id: "front", label: "Front View" },
                { id: "inside", label: "Inside Breakup" },
                { id: "produce", label: "Included Produce" },
              ].map((t) => (
                <button
                  key={t.id}
                  data-testid={`hamper-view-${t.id}`}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-[11.5px] font-semibold transition-colors ${
                    tab === t.id ? "bg-[#0f3d23] text-[#f3fbee]" : "text-[#436a51] hover:bg-[#f5f6f7]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "produce" ? (
              <div className="uf-card mt-3 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="uf-display text-base font-bold">Included Produce</h3>
                  <Check className="h-4 w-4 text-[#2f7a46]" />
                </div>
                <p className="mt-1 text-[11.5px] text-[#6d8a63]">
                  {hamper.varieties} Artisanal Varieties · {hamper.weight} Net
                </p>
                <p className="mt-3 rounded-xl bg-[#f5f6f7] px-3 py-2.5 text-[11.5px] text-[#436a51]">
                  Hand-sorted daily at 4 AM for peak Brix sweetness.
                </p>
                <ul data-testid="hamper-produce-list" className="mt-4 grid gap-3">
                  {hamper.produce.map((p) => (
                    <li key={p.name} className="flex items-start justify-between gap-3 border-b border-dashed border-[#e7e9ec] pb-2.5 last:border-0">
                      <span className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e4601f]" />
                        <span className="leading-tight">
                          <b className="block text-[12.5px] font-semibold text-[#0f3d23]">{p.name}</b>
                          <span className="text-[10px] text-[#6d8a63]">{p.note}</span>
                        </span>
                      </span>
                      <span className="shrink-0 text-[11px] font-medium text-[#436a51]">{p.qty}</span>
                    </li>
                  ))}
                </ul>

                <button
                  data-testid="hamper-policy-toggle"
                  onClick={() => setShowPolicy((v) => !v)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f5f6f7] py-2.5 text-[12px] font-semibold text-[#0f3d23]"
                >
                  View Customization Policy &amp; Weights
                  <ChevronDown className={`h-4 w-4 transition-transform ${showPolicy ? "rotate-180" : ""}`} />
                </button>
                {showPolicy && (
                  <p data-testid="hamper-policy-text" className="mt-3 text-[11.5px] leading-relaxed text-[#5c7f52]">
                    Seasonal substitutions of equal or higher value may apply based on morning intake grading. Net
                    weights carry a ±150g tolerance. Write to us before dispatch for allergen or fruit swaps at no
                    extra cost.
                  </p>
                )}
              </div>
            ) : (
              <div data-testid="hamper-tags-panel" className="mt-3 flex flex-wrap gap-2">
                <span className="uf-chip"><Leaf className="h-3.5 w-3.5 text-[#2f7a46]" /> 100% Farm Fresh</span>
                <span className="uf-chip">{hamper.vessel}</span>
                <span className="uf-chip"><Snowflake className="h-3.5 w-3.5 text-[#2f7a46]" /> 4°C Cold Pack</span>
                <span className="uf-chip"><Zap className="h-3.5 w-3.5 text-[#e4601f]" /> 3-Hour Express</span>
              </div>
            )}
          </div>

          {/* GIFT BASKET SHELF — side nav */}
          <aside className="uf-card min-w-0 p-4 lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:self-start lg:overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-[#e7e9ec] pb-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f5f6f7]">
                <Gift className="h-4 w-4 text-[#2f7a46]" />
              </span>
              <span>
                <p className="uf-eyebrow text-[#e4601f]">Gift Shelf</p>
                <h3 className="uf-display text-[15px] font-bold leading-tight text-[#0f3d23]">Explore Baskets</h3>
                <p className="text-[10px] text-[#6d8a63]">{all.length} Curated Hampers</p>
              </span>
            </div>

            <div className="uf-scroll-x mt-3 flex w-full min-w-0 max-w-full gap-3 overflow-x-auto lg:grid lg:gap-2 lg:overflow-visible">
              {all.map((h) => {
                const selected = h.slug === slug;
                return (
                  <div
                    key={h.id}
                    data-testid={`related-hamper-${h.slug}`}
                    className={`w-[180px] shrink-0 rounded-xl border p-2.5 transition-all lg:w-full ${
                      selected ? "border-[#0f3d23] bg-[#f5f6f7]" : "border-[#e7e9ec] bg-white hover:border-[#e2e4e8] hover:bg-[#fafafa]"
                    }`}
                  >
                    <Link to={`/hampers/${h.slug}`} className="flex items-center gap-2.5">
                      <img src={h.image} alt={h.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                      <span className="min-w-0 leading-tight">
                        <b className="block truncate text-[12px] font-bold text-[#0f3d23]">{h.name}</b>
                        <span className="block truncate text-[9.5px] text-[#6d8a63]">{h.weight} · {h.varieties} Varieties</span>
                        <span className="text-[10.5px] font-bold text-[#e4601f]">{inr(h.price)}</span>
                      </span>
                    </Link>
                    <button
                      data-testid={`shelf-add-hamper-${h.slug}`}
                      onClick={() => {
                        add({ kind: "hamper", item_id: h.id, slug: h.slug, name: h.name, price: h.price, image: h.image, meta: h.weight });
                        toast.success(`${h.name} added to your bucket`);
                      }}
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
            <b className="text-[13px] text-[#0f3d23]">{hamper.rating} / 5.0</b>
            <span className="ml-auto text-[11px] font-semibold text-[#6d8a63]">{hamper.reviews} Verified Reviews</span>
          </div>
          <p className="mt-3 text-[12.5px] italic leading-relaxed text-[#436a51]">
            "Delivered chilled in under 2 hours. The wicker basket is now a permanent table centrepiece and every
            single fruit arrived without a bruise."
          </p>
          <p className="mt-3 text-[11px] font-semibold text-[#0f3d23]">
            Priya R., Nariman Point <span className="font-normal text-[#6d8a63]">· Verified Cold-Chain Buyer</span>
          </p>
        </div>
      </div>

      {/* MOBILE STICKY BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center gap-3 border-t border-[#e7e9ec] bg-[#ffffff] px-4 py-3 lg:hidden">
        <div className="leading-tight">
          <b className="uf-display block text-lg font-bold text-[#0f3d23]">{inr(hamper.price * qty)}</b>
          {hamper.compare_price && <s className="text-[10px] text-[#9bb392]">{inr(hamper.compare_price)}</s>}
        </div>
        <button data-testid="mobile-add-btn" onClick={addToCart} className="uf-btn-ghost ml-auto !px-4 !py-2.5">
          Add
        </button>
        <button
          data-testid="mobile-express-btn"
          onClick={() => { addToCart(); setOpen(true); }}
          className="uf-btn-orange !px-4 !py-2.5"
        >
          <Zap className="h-4 w-4" /> Express Buy
        </button>
      </div>
    </div>
  );
}
