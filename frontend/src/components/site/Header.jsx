import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, MapPin, Truck, Menu, X, ShieldCheck, Thermometer } from "lucide-react";
import { useCart } from "@/store/CartContext";
import { api } from "@/lib/api";
import { BRAND_NAME, LOGO } from "@/constants/brand";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Baskets", to: "/baskets" },
  { label: "Fruits", to: "/fruits" },
];

export const Logo = () => (
  <Link to="/" data-testid="brand-logo" aria-label={BRAND_NAME} className="flex shrink-0 items-center gap-1.5">
    <img src={LOGO.mark} alt="" className="h-11 w-auto" />
    <img src={LOGO.wordmark} alt={BRAND_NAME} className="h-10 w-auto" />
  </Link>
);

export default function Header() {
  const { count, setOpen } = useCart();
  const [content, setContent] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api.get("/content").then((r) => setContent(r.data)).catch(() => {});
  }, []);

  useEffect(() => setMobileNav(false), [location.pathname]);

  const submit = (e) => {
    e.preventDefault();
    navigate(`/fruits?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="sticky top-0 z-40">
      <div className="hidden bg-[#0f3d23] text-[#dff0d6] md:block" data-testid="announcement-bar">
        <div className="uf-shell flex items-center justify-between gap-4 py-2 text-[11px] font-medium">
          <p className="flex items-center gap-2 truncate">
            <Truck className="h-3.5 w-3.5 text-[#e4601f]" />
            <span className="truncate">{content?.announcement || "Express Cold-Chain Logistics across Mumbai, Delhi & Bengaluru"}</span>
          </p>
          <div className="hidden shrink-0 items-center gap-5 lg:flex">
            <span className="flex items-center gap-1.5"><Thermometer className="h-3.5 w-3.5" /> 4°C Controlled Transit</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Lab Certified Brix</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-[#0f3d23] px-4 py-1.5 text-[10.5px] font-semibold text-[#dff0d6] md:hidden">
        <Truck className="h-3 w-3 shrink-0 text-[#e4601f]" />
        <span className="truncate">3-Hour Cold-Chain Delivery • Mumbai &amp; Bengaluru</span>
        <span className="ml-auto shrink-0 rounded bg-[#e4601f] px-1.5 py-0.5 text-[9px] text-white">LIVE</span>
      </div>

      <header className="border-b border-[#d8e8d0] bg-[#f3fbee]/95 backdrop-blur-xl">
        <div className="uf-shell flex items-center gap-4 py-3">
          <button
            data-testid="mobile-nav-toggle"
            onClick={() => setMobileNav((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-[#cfe3c6] bg-white md:hidden"
            aria-label="Menu"
          >
            {mobileNav ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <Logo />

          <nav className="ml-2 hidden shrink-0 items-center gap-0.5 md:flex lg:ml-5 lg:gap-1">
            {NAV.map((n) => {
              const active = n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to);
              return (
                <Link
                  key={n.label}
                  to={n.to}
                  data-testid={`nav-${n.label.toLowerCase().replace(/\s/g, "-")}`}
                  className={`whitespace-nowrap rounded-full px-2.5 py-2 text-[13px] font-medium transition-colors lg:px-3.5 lg:text-sm ${
                    active ? "bg-[#ddefd4] text-[#0f3d23]" : "text-[#2c5c3f] hover:bg-[#e6f4de]"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <form onSubmit={submit} className="ml-auto hidden min-w-0 flex-1 max-w-[320px] items-center gap-2 rounded-full border border-[#cfe3c6] bg-white px-4 py-2.5 xl:flex">
            <Search className="h-4 w-4 shrink-0 text-[#7e9b74]" />
            <input
              data-testid="header-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Dragonfruit, Berries, Hass..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#8aa380]"
            />
          </form>

          <Link to="/fruits" data-testid="customize-bucket-btn" className="uf-btn-dark ml-auto hidden shrink-0 whitespace-nowrap !px-4 !py-2.5 lg:inline-flex xl:ml-0 xl:!px-5">
            <ShoppingBag className="h-4 w-4" /> Customize Bucket
          </Link>

          <button
            data-testid="cart-button"
            onClick={() => setOpen(true)}
            className="relative ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#cfe3c6] bg-white md:ml-2"
            aria-label="Cart"
          >
            <ShoppingBag className="h-4.5 w-4.5 text-[#0f3d23]" />
            <span data-testid="cart-count" className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#e4601f] text-[10px] font-bold text-white">
              {count}
            </span>
          </button>
        </div>

        <div className="uf-shell flex items-center gap-2 pb-2.5 text-[11px] font-medium text-[#3d6b4e] md:hidden">
          <MapPin className="h-3.5 w-3.5 text-[#e4601f]" />
          Pincode: 400001, Mumbai South
          <button data-testid="change-pincode-btn" className="ml-auto font-bold uppercase tracking-wide text-[#e4601f]">
            Change
          </button>
        </div>

        {mobileNav && (
          <nav data-testid="mobile-nav-panel" className="uf-shell grid gap-1 border-t border-[#d8e8d0] py-3 md:hidden">
            {NAV.map((n) => (
              <Link key={n.label} to={n.to} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#e6f4de]">
                {n.label}
              </Link>
            ))}
            <Link to="/admin/login" className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#e4601f]">
              Admin Panel
            </Link>
          </nav>
        )}
      </header>
    </div>
  );
}
