import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/store/CartContext";
import { BRAND_NAME, LOGO } from "@/constants/brand";

export const NAV = [
  { label: "Home", to: "/" },
  { label: "Baskets", to: "/baskets" },
  { label: "Fruits", to: "/fruits" },
];

const testId = (label) => `nav-${label.toLowerCase().replace(/\s/g, "-")}`;

export const Logo = ({ size = "md" }) => (
  <Link to="/" data-testid="brand-logo" aria-label={`${BRAND_NAME} home`} className="flex shrink-0 items-center gap-1.5">
    <img
      src={LOGO.mark}
      alt=""
      width="442"
      height="496"
      className={size === "hero" ? "h-[clamp(42px,3.6vw,52px)] w-auto" : "h-10 w-auto sm:h-11"}
    />
    <img
      src={LOGO.wordmark}
      alt={BRAND_NAME}
      width="729"
      height="407"
      className={size === "hero" ? "h-[clamp(36px,3.1vw,46px)] w-auto" : "h-9 w-auto sm:h-10"}
    />
  </Link>
);

function SearchForm({ onDone, autoFocus = false, className = "" }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/fruits?q=${encodeURIComponent(q)}`);
    setQuery("");
    onDone?.();
  };

  return (
    <form role="search" onSubmit={submit} className={`flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 ${className}`}>
      <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      <input
        data-testid="header-search-input"
        type="search"
        aria-label="Search fruits"
        autoFocus={autoFocus}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onDone?.()}
        placeholder="Dragonfruit, berries, avocado…"
        className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
      />
    </form>
  );
}

const iconBtn = "relative grid place-items-center rounded-full text-gray-700 transition-colors hover:text-[#eb5a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e6425]";

const PILL = {
  bar: {
    nav: "gap-8 py-1.5 pl-8 pr-3",
    list: "gap-7 text-[14px]",
    btn: "h-9 w-9",
    icon: "h-[18px] w-[18px]",
  },
  hero: {
    nav: "gap-8 py-2 pl-9 pr-3",
    list: "gap-8 text-[15px]",
    btn: "h-10 w-10",
    icon: "h-[19px] w-[19px]",
  },
};

function CartButton({ className = "", iconClass = "h-[21px] w-[21px]" }) {
  const { count, setOpen } = useCart();
  return (
    <button
      type="button"
      data-testid="cart-button"
      onClick={() => setOpen(true)}
      aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
      className={`${iconBtn} ${className}`}
    >
      <ShoppingBag className={iconClass} strokeWidth={2.1} />
      {count > 0 && (
        <span data-testid="cart-count" className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#eb5a28] px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
}

function NavLinkItem({ item, className, onClick }) {
  const { pathname, hash } = useLocation();
  const [path, anchor] = item.to.split("#");
  const active = anchor
    ? pathname === (path || pathname) && hash === `#${anchor}`
    : item.to === "/"
      ? pathname === "/"
      : pathname.startsWith(item.to);
  return (
    <Link
      to={item.to.startsWith("#") ? { pathname, hash: item.to } : item.to}
      data-testid={testId(item.label)}
      aria-current={active ? "page" : undefined}
      onClick={() => {
        onClick?.();
        // Same hash again: the URL does not change, so scroll manually.
        if (anchor && active) document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      className={className}
    >
      {item.label}
    </Link>
  );
}

// The floating white pill from the hero design. Used inside the home hero and in the sticky bar.
export function NavPill({ className = "", size = "bar" }) {
  const sz = PILL[size];
  const [searchOpen, setSearchOpen] = useState(false);
  const wrap = useRef(null);

  useEffect(() => {
    if (!searchOpen) return;
    const close = (e) => !wrap.current?.contains(e.target) && setSearchOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [searchOpen]);

  return (
    // Positioning comes from the caller (absolute in the hero); the inner wrapper anchors the search popover.
    <div ref={wrap} className={className}>
      <div className="relative">
        <nav
          aria-label="Main"
          className={`uf-jakarta flex items-center rounded-full border border-slate-100/90 bg-white/95 shadow-[0_4px_22px_rgba(0,0,0,0.08)] backdrop-blur-md ${sz.nav}`}
        >
          <ul className={`flex items-center font-semibold text-gray-700 ${sz.list}`}>
            {NAV.map((n) => (
              <li key={n.label}>
                <NavLinkItem
                  item={n}
                  className="whitespace-nowrap transition-colors hover:text-[#eb5a28] aria-[current=page]:text-[#3e6425]"
                />
              </li>
            ))}
          </ul>
          <div className="flex items-center">
            <button
              type="button"
              data-testid="search-toggle"
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
              className={`${iconBtn} ${sz.btn}`}
            >
              <Search className={sz.icon} strokeWidth={2.1} />
            </button>
            <CartButton className={sz.btn} iconClass={sz.icon} />
          </div>
        </nav>
        {searchOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-[min(360px,90vw)] rounded-2xl bg-white p-2 shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
            <SearchForm autoFocus onDone={() => setSearchOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
}

// Scrolls to `#anchor` targets after navigation (react-router does not do this by itself).
function useHashScroll() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    return () => clearTimeout(t);
  }, [pathname, hash]);
}

// True while the home hero card is on screen; the desktop bar stays hidden until it scrolls away.
function useHeroVisible(enabled) {
  const [visible, setVisible] = useState(enabled);
  useEffect(() => {
    if (!enabled) return setVisible(false);
    const el = document.getElementById("hero");
    if (!el) return setVisible(false);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "-80px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);
  return visible;
}

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const heroVisible = useHeroVisible(isHome);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useHashScroll();
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.hash]);

  // On the home page (desktop) the hero card carries its own logo and nav,
  // so this bar is fixed and only slides in once the hero is out of view.
  const homeDesktop = isHome
    ? `lg:fixed lg:inset-x-0 lg:transition-[transform,visibility] lg:duration-300 ${
        heroVisible ? "lg:invisible lg:-translate-y-full" : "lg:visible lg:translate-y-0"
      }`
    : "";

  return (
    <header data-testid="site-header" className={`sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur-md ${homeDesktop}`}>
      <div className="mx-auto flex w-full max-w-[1288px] items-center gap-3 px-4 py-3 sm:px-6 lg:py-3.5">
        <Logo />

        <NavPill className="ml-auto hidden lg:block" />

        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <button
            type="button"
            data-testid="mobile-search-toggle"
            aria-label="Search"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
            className={`${iconBtn} h-10 w-10`}
          >
            <Search className="h-[21px] w-[21px]" strokeWidth={2.1} />
          </button>
          <CartButton className="h-10 w-10" />
          <button
            type="button"
            data-testid="mobile-nav-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => setMenuOpen((v) => !v)}
            className={`${iconBtn} h-10 w-10`}
          >
            {menuOpen ? <X className="h-[22px] w-[22px]" /> : <Menu className="h-[22px] w-[22px]" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="px-4 pb-3 sm:px-6 lg:hidden">
          <SearchForm autoFocus onDone={() => setSearchOpen(false)} />
        </div>
      )}

      {menuOpen && (
        <nav id="mobile-nav-panel" data-testid="mobile-nav-panel" aria-label="Mobile" className="uf-jakarta grid gap-1 border-t border-slate-100 px-4 py-3 sm:px-6 lg:hidden">
          {NAV.map((n) => (
            <NavLinkItem
              key={n.label}
              item={n}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-3 py-3 text-[15px] font-semibold text-gray-700 hover:bg-slate-50 aria-[current=page]:text-[#3e6425]"
            />
          ))}
        </nav>
      )}
    </header>
  );
}
