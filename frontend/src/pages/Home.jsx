import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight, ChevronLeft, ChevronRight, Droplet, Gift, Leaf, Snowflake,
  Sparkles, Star, Truck, ShieldCheck, Zap, Wand2,
} from "lucide-react";
import { api, inr, media } from "@/lib/api";
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

export default function Home() {
  const [hampers, setHampers] = useState([]);
  const [content, setContent] = useState(null);
  const [filter, setFilter] = useState("all");
  const [params] = useSearchParams();
  const railRef = useRef(null);
  const { add, setOpen } = useCart();

  useEffect(() => {
    if (params.get("curation")) setFilter(params.get("curation"));
  }, [params]);

  useEffect(() => {
    api.get("/hampers").then((r) => setHampers(r.data)).catch(() => {});
    api.get("/content").then((r) => setContent(r.data)).catch(() => {});
  }, []);

  const hero = useMemo(() => hampers.find((h) => h.popular) || hampers[0], [hampers]);
  const shown = useMemo(
    () => (filter === "all" ? hampers : hampers.filter((h) => h.curation === filter)),
    [hampers, filter]
  );

  const addToCart = (h) => {
    add({ kind: "hamper", item_id: h.id, slug: h.slug, name: h.name, price: h.price, image: h.image, meta: h.weight });
    toast.success(`${h.name} added to your bucket`);
  };

  const scrollRail = (dir) =>
    railRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#f7f7f8] uf-noise">
        <div className="uf-shell relative grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_1fr_136px] lg:gap-8 lg:py-20">
          <div className="uf-rise">
            <p className="uf-eyebrow flex items-center gap-3 text-[#4d7a5c]">
              Nature's Goodness <span className="h-[2px] w-10 bg-[#e4601f]" />
            </p>
            <h1 className="uf-display mt-5 text-4xl font-black leading-[1.03] text-[#0f3d23] sm:text-5xl lg:text-6xl">
              100% Farm Fresh
              <span className="mt-1 block font-light italic">Exotic Fruit Hampers</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-[#436a51] sm:text-base">
              Crafted from hand-plucked botanical orchards across tropical groves and alpine foothills. Pure authentic
              sweetness, zero preservatives, chilled to 4°C active perfection.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#hampers" data-testid="hero-order-now" className="uf-btn-dark">
                Order Now <ArrowRight className="h-4 w-4" />
              </a>              <Link to="/fruits" data-testid="hero-build-custom" className="uf-btn-ghost">
                <Gift className="h-4 w-4" /> Build Custom Box
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-xs">
              <span className="flex items-start gap-2">
                <Truck className="mt-0.5 h-4 w-4 text-[#e4601f]" />
                <span>
                  <b className="block text-[#0f3d23]">3-Hr Rapid Delivery</b>
                  <span className="text-[#6d8a63]">Mumbai, Delhi &amp; BLR</span>
                </span>
              </span>
              <span className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-[#e4601f]" />
                <span>
                  <b className="block text-[#0f3d23]">FSSAI &amp; GlobalGAP</b>
                  <span className="text-[#6d8a63]">100% Certified Safe</span>
                </span>
              </span>
            </div>
          </div>

          <div className="relative uf-rise" style={{ animationDelay: "120ms" }}>
            <span className="uf-chip absolute -top-3 left-1/2 z-10 -translate-x-1/2 shadow-sm">
              <Leaf className="h-3.5 w-3.5 text-[#2f7a46]" /> 100% Organic Origin
            </span>
            <div className="rounded-[28px] border border-[#e7e9ec] bg-[#ffffff] p-3 shadow-[0_24px_60px_-28px_rgba(15,61,35,0.4)] sm:p-4">
              <div className="relative overflow-hidden rounded-[20px]">
                <img
                  src={hero?.image || media("catalog/royal.jpg")}
                  alt={hero?.name || "Fruit hamper"}
                  className="h-[260px] w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-[340px]"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold tracking-wide text-[#0f3d23]">
                  • Plucked This Morning
                </span>
              </div>
              {hero && (
                <Link to={`/hampers/${hero.slug}`} className="mt-3 flex items-end justify-between px-1.5 pb-1">
                  <span>
                    <b className="block text-sm font-semibold text-[#0f3d23]">{hero.name}</b>
                    <span className="text-[11px] text-[#6d8a63]">
                      Weight: {hero.weight} · {hero.varieties} Premium Varieties
                    </span>
                  </span>
                  <span className="text-right">
                    <b className="uf-display block text-lg font-bold text-[#e4601f]">{inr(hero.price)}</b>
                    {hero.compare_price && (
                      <s className="text-[11px] text-[#9bb392]">{inr(hero.compare_price)}</s>
                    )}
                  </span>
                </Link>
              )}
            </div>

          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-1 lg:gap-3">
            {[
                { icon: Leaf, t: "100%", s: "Natural Fruits" },
                { icon: ShieldCheck, t: "Rich In", s: "Vitamins & Immunity" },
                { icon: Sparkles, t: "15+", s: "Curated Fruits" },
                { icon: Droplet, t: "Zero", s: "Preservatives" },
              ].map(({ icon: Icon, t, s }) => (
                <div key={t} className="uf-card flex items-center gap-2 p-2.5 lg:w-[132px] lg:flex-col lg:text-center">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f1f2f4]">
                    <Icon className="h-3.5 w-3.5 text-[#2f7a46]" />
                  </span>
                  <span className="leading-tight">
                    <b className="block text-[11px] font-bold text-[#0f3d23]">{t}</b>
                    <span className="text-[9px] text-[#6d8a63]">{s}</span>
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* CURATIONS RAIL */}
        <div className="uf-shell pb-12">
          <div className="uf-card flex items-center gap-4 p-4 sm:gap-6 sm:p-5">
            <div className="shrink-0">
              <p className="uf-eyebrow text-[#6d8a63]">Explore Our</p>
              <p className="uf-display text-lg font-bold">
                Curations <span className="text-[#9bb392]">({content?.curations?.length || 8})</span>
              </p>
            </div>
            <div ref={railRef} className="uf-scroll-x flex flex-1 gap-5 overflow-x-auto">
              {(content?.curations || []).map((c) => (
                <Link
                  key={c.id}
                  to={`/baskets?curation=${c.id}`}
                  data-testid={`curation-${c.id}`}
                  className="group flex w-[76px] shrink-0 flex-col items-center gap-1.5 text-center"
                >
                  <img
                    src={c.image}
                    alt={c.label}
                    className="h-12 w-12 rounded-full border-2 border-[#e7e9ec] object-cover transition-all duration-300 group-hover:border-[#e4601f]"
                  />
                  <span className="text-[10px] font-medium leading-tight text-[#436a51]">{c.label}</span>
                </Link>
              ))}
            </div>
            <div className="hidden shrink-0 gap-2 sm:flex">
              <button data-testid="curation-prev" onClick={() => scrollRail(-1)} className="grid h-8 w-8 place-items-center rounded-full border border-[#e2e4e8] bg-white">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button data-testid="curation-next" onClick={() => scrollRail(1)} className="grid h-8 w-8 place-items-center rounded-full border border-[#e2e4e8] bg-white">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PROMISE STRIP */}
      <section className="border-y border-[#e7e9ec] bg-[#eef0f2]">
        <div className="uf-shell grid grid-cols-2 gap-4 py-5 lg:grid-cols-4">
          {(content?.promises || []).map((p) => {
            const Icon = ICONS[p.icon] || Leaf;
            return (
              <div key={p.title} className="flex items-center gap-3">
                <Icon className="h-5 w-5 shrink-0 text-[#e4601f]" />
                <span className="leading-tight">
                  <b className="block text-[13px] font-semibold text-[#0f3d23]">{p.title}</b>
                  <span className="text-[10px] text-[#5c7f52]">{p.note}</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* HAMPERS */}
      <section id="hampers" className="bg-[#f7f7f8] py-16 lg:py-20">
        <div className="uf-shell">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="uf-eyebrow text-[#6d8a63]">Signature Offerings</p>
              <h2 className="uf-display mt-3 text-3xl font-bold text-[#0f3d23] sm:text-4xl">
                Curated Gourmet Hampers
              </h2>
              <p className="mt-3 max-w-xl text-sm text-[#436a51] md:text-base">
                Hand-sorted exotic fruits paired with bespoke gift packaging for wellness and prestige celebrations.
              </p>
            </div>
            <div className="uf-scroll-x flex gap-2 overflow-x-auto">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  data-testid={`filter-${f.id}`}
                  onClick={() => setFilter(f.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                    filter === f.id ? "bg-[#0f3d23] text-[#f3fbee]" : "border border-[#e2e4e8] bg-white text-[#436a51]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div data-testid="hamper-grid" className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((h) => (
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
              No hampers in this curation yet.
            </p>
          )}
        </div>
      </section>

      {/* DIFFERENCE */}
      <section className="bg-[#eef0f2] py-16 lg:py-20">
        <div className="uf-shell text-center">
          <p className="uf-eyebrow text-[#e4601f]">Unrivaled Quality Standard</p>
          <h2 className="uf-display mx-auto mt-3 max-w-2xl text-3xl font-bold text-[#0f3d23] sm:text-4xl">
            The Urban Fruto Difference
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#436a51] md:text-base">
            Unlike standard marketplace grocery deliveries, every Urban Fruto hamper undergoes a museum-grade quality
            intake protocol before hand-assembly.
          </p>
          <div className="mt-10 grid gap-5 text-left sm:grid-cols-2 lg:grid-cols-4">
            {(content?.difference || []).map((d) => {
              const Icon = ICONS[d.icon] || Leaf;
              return (
                <div key={d.title} className="uf-card flex flex-col p-5 transition-transform duration-300 hover:-translate-y-1">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f1f2f4]">
                    <Icon className="h-4.5 w-4.5 text-[#2f7a46]" />
                  </span>
                  <h3 className="mt-4 text-[15px] font-bold leading-snug text-[#0f3d23]">{d.title}</h3>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-[#5c7f52]">{d.body}</p>
                  <p className="mt-5 text-[11px] font-bold uppercase tracking-wide text-[#e4601f]">{d.stat}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CUSTOM BUILDER CTA */}
      <section className="bg-[#f7f7f8] py-16 lg:py-20">
        <div className="uf-shell">
          <div className="relative overflow-hidden rounded-3xl bg-[#143f27] p-6 sm:p-10 lg:p-12 uf-noise">
            <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div>
                <span className="uf-chip !border-[#2f6243] !bg-[#1c5134] !text-[#cfe6c4]">
                  <Wand2 className="h-3.5 w-3.5" /> Bespoke Gift Studio
                </span>
                <h2 className="uf-display mt-5 text-3xl font-bold leading-tight text-[#f3fbee] sm:text-4xl">
                  Create Your Own Custom Fruit Bucket
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#a8c99c] md:text-base">
                  Select your vessel, curate favorite seasonal exotics, add artisanal gourmet pairings like clover honey
                  or roasted pistachios, and pen a handwritten card.
                </p>
                <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {["Pick Basket", "Choose Fruits", "Gourmet Add-ons", "Gift Message"].map((s, i) => (
                    <div key={s} className="rounded-xl border border-[#2f6243] bg-[#1c5134] px-3 py-2.5">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[#e4601f]">Step 0{i + 1}</p>
                      <p className="mt-1 text-[12px] font-semibold text-[#e7f5e0]">{s}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Link to="/fruits" data-testid="launch-studio-btn" className="uf-btn-orange">
                    Launch Interactive Studio <Sparkles className="h-4 w-4" />
                  </Link>
                  <span className="text-xs text-[#a8c99c]">From ₹999 + Free Delivery</span>
                </div>
              </div>

              <div className="rounded-2xl bg-[#ffffff] p-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-bold text-[#0f3d23]">Live Hamper Configurator</p>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#e4601f]">Live Preview</span>
                </div>
                <dl className="mt-4 grid gap-2 text-[11.5px]">
                  {[
                    ["Vessel Type", "Natural Willow Oval Wicker"],
                    ["Selected Fruits", "Mangosteen, Pitaya, Black Figs (3 total)"],
                    ["Ribbon & Lining", "Sage Green French Linen"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border-b border-dashed border-[#e7e9ec] pb-2">
                      <dt className="text-[#6d8a63]">{k}</dt>
                      <dd className="text-right font-semibold text-[#0f3d23]">{v}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1">
                    <dt className="font-semibold text-[#6d8a63]">Calculated Total</dt>
                    <dd className="uf-display text-base font-bold text-[#e4601f]">₹1,840</dd>
                  </div>
                </dl>
                <div className="relative mt-4 overflow-hidden rounded-xl">
                  <img
                    src={media("catalog/orchard.jpg")}
                    alt="Configurator preview"
                    className="h-[120px] w-full object-cover"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-[#0f3d23]/25">
                    <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold text-[#0f3d23]">
                      Drag &amp; Drop Ready
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-[#eef0f2] py-16 lg:py-20">
        <div className="uf-shell text-center">
          <p className="uf-eyebrow text-[#e4601f]">Verified Expressions</p>
          <h2 className="uf-display mx-auto mt-3 max-w-xl text-3xl font-bold text-[#0f3d23] sm:text-4xl">
            Celebrated by Discerning Givers
          </h2>
          <div className="mt-10 grid gap-5 text-left lg:grid-cols-3">
            {(content?.testimonials || []).map((t) => (
              <blockquote key={t.name} data-testid={`testimonial-${t.initials}`} className="uf-card flex flex-col p-5">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-[#e4601f] text-[#e4601f]" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-[12.5px] italic leading-relaxed text-[#436a51]">"{t.quote}"</p>
                <footer className="mt-5 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#eef0f2] text-[11px] font-bold text-[#0f3d23]">
                    {t.initials}
                  </span>
                  <span className="leading-tight">
                    <b className="block text-[13px] text-[#0f3d23]">{t.name}</b>
                    <span className="text-[10px] text-[#6d8a63]">{t.meta}</span>
                  </span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
