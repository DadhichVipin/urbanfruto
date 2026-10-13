import { Link } from "react-router-dom";
import { Leaf, ShieldCheck, Mail } from "lucide-react";

const LINKS = [
  { label: "Farm Origins", to: "/baskets" },
  { label: "Cold-Chain Guarantee", to: "/baskets" },
  { label: "Corporate Gifting", to: "/gifting" },
  { label: "Privacy Policy", to: "/" },
  { label: "Terms of Service", to: "/" },
];

export default function Footer() {
  return (
    <footer data-testid="site-footer" className="bg-[#0f3d23] text-[#cfe6c4]">
      <div className="uf-shell grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_auto] md:gap-14">
        <div>
          <h3 className="uf-display text-2xl font-bold text-[#f3fbee]">Urban Fresh</h3>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#a8c99c]">
            Bespoke artisanal fruit hampers &amp; orchard exotics delivered within 3 hours under strict cold-chain
            guarantee.
          </p>
          <p className="mt-6 text-xs text-[#7fa873]">
            © 2026 Urban Fresh Botanicals &amp; Fruits. All rights reserved.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-2">
          {LINKS.map((l) => (
            <Link key={l.label} to={l.to} className="text-[#cfe6c4] transition-colors hover:text-white">
              {l.label}
            </Link>
          ))}
          <Link to="/admin/login" data-testid="footer-admin-link" className="font-semibold text-[#e4601f] hover:text-[#ff7b3a]">
            Admin Panel
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#8db881]">
            FSSAI CERTIFIED • 100% ORGANIC
          </p>
          <div className="flex gap-2.5">
            {[Leaf, ShieldCheck, Mail].map((Icon, i) => (
              <span key={i} className="grid h-10 w-10 place-items-center rounded-full bg-[#1b5333]">
                <Icon className="h-4 w-4 text-[#cfe6c4]" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
