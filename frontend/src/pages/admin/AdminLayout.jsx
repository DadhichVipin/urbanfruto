import { useEffect, useState } from "react";
import { Link, Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Boxes, Inbox, LayoutDashboard, LogOut, Settings, Users, ExternalLink, Menu, X } from "lucide-react";
import { api } from "@/lib/api";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { to: "/admin/customers", label: "Users", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const token = localStorage.getItem("uf_admin_token");
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get("/admin/me").then((r) => setAdmin(r.data)).catch(() => {
      localStorage.removeItem("uf_admin_token");
      navigate("/admin/login");
    });
  }, [token, navigate]);

  if (!token) return <Navigate to="/admin/login" replace />;

  const logout = () => {
    localStorage.removeItem("uf_admin_token");
    navigate("/admin/login");
  };

  return (
    <div data-testid="admin-layout" className="min-h-screen bg-[#eaf6e4] lg:flex">
      <aside className="shrink-0 bg-[#0f3d23] lg:w-[246px]">
        <div className="flex items-center justify-between px-5 py-4">
          <Link to="/admin" className="uf-display text-lg font-bold text-[#f3fbee]">
            Urban Fresh <span className="text-[#e4601f]">·</span> Admin
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
