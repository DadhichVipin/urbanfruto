import { useEffect, useState } from "react";
import { Link, Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Boxes, Inbox, LayoutDashboard, LogOut, Settings, Users, ExternalLink, Menu, X } from "lucide-react";
import { api } from "@/lib/api";
import { BRAND_NAME, LOGO } from "@/constants/brand";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { to: "/admin/customers", label: "Users", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  // "checking" until the backend confirms the session cookie; nothing admin renders before that.
  const [status, setStatus] = useState("checking");
  const [admin, setAdmin] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Tokens used to live in localStorage; clear any left behind.
    localStorage.removeItem("uf_admin_token");
    localStorage.removeItem("uf_admin_email");
    api
      .get("/admin/me")
      .then((r) => {
        setAdmin(r.data);
        setStatus("ok");
      })
      .catch(() => setStatus("denied"));
  }, []);

  if (status === "denied") return <Navigate to="/admin/login" replace />;
  if (status === "checking")
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f7f8]" aria-busy="true">
        <Loader2 className="h-6 w-6 animate-spin text-[#0f3d23]" aria-label="Loading" />
      </div>
    );

  const logout = async () => {
    await api.post("/admin/logout").catch(() => {});
    navigate("/admin/login", { replace: true });
  };

  return (
    <div data-testid="admin-layout" className="min-h-screen bg-[#f7f7f8] lg:flex">
      <aside className="shrink-0 bg-[#0f3d23] lg:w-[246px]">
        <div className="flex items-center justify-between px-5 py-4">
          <Link to="/admin" className="flex items-center gap-2.5 uf-display text-lg font-bold text-[#f3fbee]">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#ffffff]">
              <img src={LOGO.mark} alt="" className="h-6 w-auto" />
            </span>
            {BRAND_NAME} <span className="text-[#e4601f]">·</span> Admin
          </Link>
          <button data-testid="admin-sidebar-toggle" onClick={() => setOpen((v) => !v)} className="text-[#cfe6c4] lg:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav className={`${open ? "grid" : "hidden"} gap-1 px-3 pb-4 lg:grid`}>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              data-testid={`admin-nav-${label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
                  isActive ? "bg-[#1c5134] text-white" : "text-[#a8c99c] hover:bg-[#164428]"
                }`
              }
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
          <Link to="/" className="mt-3 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] text-[#a8c99c] hover:bg-[#164428]">
            <ExternalLink className="h-4 w-4" /> View Storefront
          </Link>
          <button
            data-testid="admin-logout"
            onClick={logout}
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[13px] text-[#f0a98c] hover:bg-[#164428]"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-10">
        <p className="mb-5 text-[11.5px] text-[#6d8a63]" data-testid="admin-signed-in">
          Signed in as <b className="text-[#0f3d23]">{admin?.email || "…"}</b>
        </p>
        <Outlet />
      </main>
    </div>
  );
}
