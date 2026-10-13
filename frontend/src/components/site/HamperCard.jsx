import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { inr } from "@/lib/api";

export const HamperCard = ({ hamper: h, onAdd, onOrder }) => (
  <article
    data-testid={`hamper-card-${h.slug}`}
    className={`relative flex min-w-0 flex-col rounded-2xl border bg-[#ffffff] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_50px_-30px_rgba(15,61,35,0.5)] ${
      h.popular ? "border-[#e4601f]" : "border-[#e7e9ec]"
    }`}
  >
    {h.popular && (
      <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#e4601f] px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
        Most Popular · Chef's Choice
      </span>
    )}
    <Link to={`/hampers/${h.slug}`} className="relative overflow-hidden rounded-xl">
      <img src={h.image} alt={h.name} className="h-[190px] w-full object-cover transition-transform duration-700 hover:scale-105" />
      <span className="absolute left-2.5 top-2.5 rounded-md bg-white/95 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#0f3d23]">
        {h.badge || "Signature"}
      </span>
      {h.varieties > 0 && (
        <span className="absolute bottom-2.5 left-2.5 rounded-md bg-[#e4601f] px-2 py-1 text-[9px] font-bold text-white">
          {h.varieties} Varieties
        </span>
      )}
    </Link>

    <div className="mt-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <Link to={`/hampers/${h.slug}`} className="uf-display block text-lg font-bold text-[#0f3d23]">
          {h.name}
        </Link>
        <p className="mt-0.5 text-[11px] text-[#6d8a63]">
          Weight: {h.weight} · {h.vessel}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <b className="uf-display block text-lg font-bold text-[#e4601f]">{inr(h.price)}</b>
        {h.compare_price && <s className="text-[11px] text-[#9bb392]">{inr(h.compare_price)}</s>}
      </div>
    </div>

    <ul className="mt-3 grid gap-1.5">
      {h.contents.slice(0, 4).map((c) => (
        <li key={c} className="flex items-start gap-1.5 text-[11.5px] leading-snug text-[#436a51]">
          <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#2f7a46]" /> {c}
        </li>
      ))}
    </ul>

    <div className="mt-auto grid grid-cols-2 gap-2.5 pt-5">
      <button data-testid={`add-cart-${h.slug}`} onClick={() => onAdd(h)} className="uf-btn-ghost !px-3 !py-2.5">
        Add to Cart
      </button>
      <button
        data-testid={`order-now-${h.slug}`}
        onClick={() => onOrder(h)}
        className={h.popular ? "uf-btn-orange !px-3 !py-2.5" : "uf-btn-dark !px-3 !py-2.5"}
      >
        Order Now
      </button>
    </div>
  </article>
);
