import { Link } from "react-router-dom";
import { Check, CircleCheck, Zap } from "lucide-react";
import { media } from "@/lib/api";
import { Logo, NavPill } from "@/components/site/Header";

const HERO_IMG = {
  src: media("site/hero-1376-v1.webp"),
  srcSet: `${media("site/hero-800-v1.webp")} 800w, ${media("site/hero-1376-v1.webp")} 1376w`,
  // Identical on both layouts so the browser downloads one file.
  sizes: "(min-width: 1024px) 60vw, 100vw",
  alt: "A farmer hands a basket of fresh fruit to a smiling family at their kitchen table",
};

const TRUST = [
  { icon: Check, label: "100% Farm Fresh" },
  { icon: CircleCheck, label: "Handpicked" },
  { icon: Zap, label: "Same-Day Delivery" },
];

const Leaf = ({ className, fill, d = "M10,90 C15,20 80,10 90,10 C85,80 20,85 10,90 Z" }) => (
  <svg aria-hidden="true" viewBox="0 0 100 100" className={`pointer-events-none absolute ${className}`} fill={fill}>
    <path d={d} />
  </svg>
);

const HeroImage = ({ className }) => (
  <img
    src={HERO_IMG.src}
    srcSet={HERO_IMG.srcSet}
    sizes={HERO_IMG.sizes}
    alt={HERO_IMG.alt}
    width="1376"
    height="768"
    fetchPriority="high"
    decoding="async"
    className={className}
  />
);

const btnBase =
  "uf-jakarta inline-flex items-center justify-center rounded-full font-bold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e6425] focus-visible:ring-offset-2";
const btnSolid = `${btnBase} bg-[#3e6425] text-white shadow-sm hover:-translate-y-0.5 hover:bg-[#32521d] hover:shadow-md`;
const btnOutline = `${btnBase} border-[1.8px] border-[#3e6425] text-[#34531e] hover:bg-[#3e6425]/5`;

// Desktop: full-bleed. Text gets its own white column on the left, the photo fills the
// right 60%, and the curved edge only bites into the photo near the top (orchard), so
// it never covers the text or the family.
//
// Photo framing: the hero height is clamped so the photo always fills it by height, and
// object-position 65% keeps all five faces (x 305–1200 of the 1376px source) in view
// from 1024px to 1920px+, clear of the curve.
const GUTTER = "[--hero-gutter:max(2.5rem,calc((100vw-1360px)/2))]";

function DesktopHero() {
  return (
    <div
      id="hero"
      data-testid="hero-card"
      className={`relative hidden h-[clamp(500px,44vw,760px)] overflow-hidden bg-white lg:block ${GUTTER}`}
    >
      <div className="absolute inset-y-0 right-0 w-[min(60%,1330px)]">
        <HeroImage className="h-full w-full object-cover object-[65%_center]" />

        <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
          <path fill="#7ca43b" d="M 7 0 C 13 8, 20 16, 19 27 C 18 40, 5 48, 3 62 C 2 74, 2 88, 4 100 L 6.6 100 C 4.6 88, 4.6 74, 5.8 62 C 7.8 48, 21.6 40, 22.6 27 C 23.6 16, 16.6 8, 10.6 0 Z" />
          <path fill="#436f27" d="M 7 0 C 13 8, 20 16, 19 27 C 18 40, 5 48, 3 62 C 2 74, 2 88, 4 100 L 5.2 100 C 3.2 88, 3.2 74, 4.4 62 C 6.4 48, 19.8 40, 20.8 27 C 21.8 16, 14.8 8, 8.8 0 Z" />
          <path fill="#ffffff" d="M 0 0 L 7.2 0 C 13.2 8, 20.2 16, 19.2 27 C 18.2 40, 5.2 48, 3.2 62 C 2.2 74, 2.2 88, 4.2 100 L 0 100 Z" />
        </svg>
      </div>

      <Leaf className="left-[2%] top-[22%] h-14 w-auto rotate-[25deg] opacity-50 blur-[3px]" fill="#5f9524" />
      <Leaf className="bottom-[8%] left-[30%] h-10 w-auto -rotate-[35deg] opacity-40 blur-[3px]" fill="#5f9623" d="M10,90 C15,15 90,10 90,10 C85,85 10,90 10,90 Z" />
      <Leaf className="left-[49%] top-[30%] z-10 h-6 w-auto -rotate-12 opacity-85 blur-[0.6px]" fill="#7bb532" d="M10,90 C15,15 90,10 90,10 C85,85 10,90 10,90 Z" />

      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-[var(--hero-gutter)] pt-6">
        <Logo size="hero" />
        <NavPill size="hero" />
      </div>

      <div className="uf-jakarta absolute inset-y-0 left-0 right-[min(60%,1330px)] z-20 flex items-center pb-4 pl-[var(--hero-gutter)] pr-8 pt-24">
        <div className="max-w-[500px]">
          <p className="text-[clamp(15px,1.4vw,20px)] font-extrabold uppercase tracking-[0.06em] text-[#436e26]">Beyond Fresh.</p>
          <h1 className="mt-3 text-[clamp(30px,3vw,48px)] font-black uppercase leading-[1.06] tracking-tight text-[#132612]">
            Global Fruit
            <br />
            Baskets,
            <br />
            Home Delivered.
          </h1>
          <p className="mt-5 max-w-[34ch] text-[clamp(14px,1.05vw,16px)] leading-[1.7] text-gray-600">
            Experience the world's finest fruits, imported and export-quality, delivered daily to your doorstep.
            Freshness redefined for urban living.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/fruits" data-testid="hero-shop-now" className={`${btnSolid} px-7 py-3.5 text-[13px]`}>
              Shop Now
            </Link>
            <Link to="/baskets" data-testid="hero-discover-baskets" className={`${btnOutline} px-6 py-3 text-[13px]`}>
              Discover Our Baskets
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileHero() {
  return (
    <div className="lg:hidden">
      <div className="relative overflow-hidden">
        <HeroImage className="aspect-[4/3] w-full object-cover object-[68%_center] sm:aspect-[16/9]" />
        <svg aria-hidden="true" viewBox="0 0 400 60" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-[8%] w-full">
          <path d="M0 26 C 120 6 260 16 400 38 L400 44 C 260 22 120 12 0 32 Z" fill="#7ba238" />
          <path d="M0 32 C 120 12 260 22 400 44 L400 52 C 260 30 120 20 0 40 Z" fill="#3c6428" />
          <path d="M0 40 C 120 20 260 30 400 52 L400 60 L0 60 Z" fill="#ffffff" />
        </svg>
      </div>

      <div className="uf-jakarta mx-auto max-w-2xl px-5 pb-9 pt-7 sm:px-8 sm:pt-9">
        <p className="text-[15px] font-extrabold uppercase tracking-[0.08em] text-[#436e26] sm:text-[18px]">Beyond Fresh.</p>
        <h1 className="mt-2 text-[clamp(26px,7.6vw,44px)] font-black uppercase leading-[1.1] tracking-tight text-[#132612]">
          Global Fruit Baskets,
          <br />
          Home Delivered.
        </h1>
        <p className="mt-4 text-[15px] leading-[1.75] text-gray-600 sm:text-base">
          Experience the world's finest fruits, imported and export-quality, delivered daily to your doorstep.
          Freshness redefined for urban living.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link to="/fruits" data-testid="hero-shop-now-mobile" className={`${btnSolid} px-8 py-3.5 text-[14px] sm:text-[13px]`}>
            Shop Now
          </Link>
          <Link to="/baskets" data-testid="hero-discover-baskets-mobile" className={`${btnOutline} px-8 py-3 text-[14px] sm:text-[13px]`}>
            Discover Our Baskets
          </Link>
        </div>
      </div>

      <ul className="uf-jakarta grid grid-cols-3 divide-x divide-slate-200 bg-[#fbf9f4] py-4">
        {TRUST.map(({ icon: Icon, label }) => (
          <li key={label} className="flex flex-col items-center gap-1.5 px-1 text-center">
            <Icon className="h-[18px] w-[18px] text-[#3c6428]" strokeWidth={2.2} aria-hidden="true" />
            <span className="text-[12px] font-semibold leading-tight text-slate-800 sm:text-[13px]">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Hero() {
  return (
    <section aria-label="Welcome" data-testid="hero">
      <DesktopHero />
      <MobileHero />
    </section>
  );
}
