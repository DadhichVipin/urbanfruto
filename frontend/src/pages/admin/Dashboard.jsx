import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Boxes, IndianRupee, Inbox, Users } from "lucide-react";
import { api, inr } from "@/lib/api";

const STATUS_COLORS = {
  new: "bg-[#ffe6d6] text-[#c04d13]",
  contacted: "bg-[#eef0f2] text-[#2f7a46]",
  confirmed: "bg-[#d6e9ff] text-[#1a4f91]",
  delivered: "bg-[#e3e3ff] text-[#3b3b8f]",
  cancelled: "bg-[#ffe0e0] text-[#a33]",
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data)).catch(() => {});
  }, []);

  if (!stats) return <p data-testid="dashboard-loading" className="text-sm text-[#6d8a63]">Loading dashboard…</p>;

  const cards = [
    { label: "Total Enquiries", value: stats.enquiries, icon: Inbox },
    { label: "Enquiry Value", value: inr(stats.revenue), icon: IndianRupee },
    { label: "Customers", value: stats.customers, icon: Users },
    { label: "Catalog Items", value: stats.hampers + stats.fruits, icon: Boxes },
    { label: "Low Stock Alerts", value: stats.low_stock, icon: AlertTriangle },
  ];

  const maxTrend = Math.max(1, ...stats.trend.map((t) => t.value));

  return (
    <div data-testid="admin-dashboard">
      <h1 className="uf-display text-3xl font-bold text-[#0f3d23]">Dashboard</h1>
      <p className="mt-1.5 text-[13px] text-[#6d8a63]">Live snapshot of orders, catalog and customers.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`} className="uf-card p-4">
            <Icon className="h-4.5 w-4.5 text-[#e4601f]" />
            <b className="uf-display mt-3 block text-2xl font-bold text-[#0f3d23]">{value}</b>
            <span className="text-[11px] text-[#6d8a63]">{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="uf-card p-5">
          <h2 className="uf-display text-lg font-bold">Enquiry Value · Last 7 Days</h2>
          {stats.trend.length === 0 ? (
            <p className="mt-6 text-sm text-[#6d8a63]">No enquiries yet.</p>
          ) : (
            <div className="mt-6 flex h-[180px] items-end gap-3">
              {stats.trend.map((t) => (
                <div key={t.date} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg bg-[#0f3d23] transition-all duration-700"
                    style={{ height: `${Math.max(6, (t.value / maxTrend) * 150)}px` }}
                    title={inr(t.value)}
                  />
                  <span className="text-[9.5px] text-[#6d8a63]">{t.date.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="uf-card p-5">
          <h2 className="uf-display text-lg font-bold">Top Selling Items</h2>
          <ul className="mt-4 grid gap-2.5">
            {stats.top_items.length === 0 && <li className="text-sm text-[#6d8a63]">No data yet.</li>}
            {stats.top_items.map((t) => (
              <li key={t.name} className="flex items-center justify-between border-b border-dashed border-[#e7e9ec] pb-2 last:border-0">
                <span className="truncate text-[12.5px] text-[#0f3d23]">{t.name}</span>
                <b className="shrink-0 text-[12px] text-[#e4601f]">{t.qty} units</b>
              </li>
            ))}
          </ul>

          <h3 className="uf-display mt-6 text-base font-bold">By Status</h3>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {Object.entries(stats.by_status).map(([k, v]) => (
              <span key={k} className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${STATUS_COLORS[k] || "bg-[#f5f6f7]"}`}>
                {k}: {v}
              </span>
            ))}
            {Object.keys(stats.by_status).length === 0 && <span className="text-sm text-[#6d8a63]">—</span>}
          </div>
        </div>
      </div>

      <div className="uf-card mt-5 p-5">
        <div className="flex items-center justify-between">
          <h2 className="uf-display text-lg font-bold">Latest Enquiries</h2>
          <Link to="/admin/enquiries" className="text-[12px] font-semibold text-[#e4601f]">View all →</Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[12.5px]">
            <thead className="text-[10.5px] uppercase tracking-wide text-[#6d8a63]">
              <tr>
                <th className="pb-2">Ref</th><th className="pb-2">Customer</th><th className="pb-2">Items</th>
                <th className="pb-2">Total</th><th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.latest.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-[#6d8a63]">No enquiries yet.</td></tr>
              )}
              {stats.latest.map((e) => (
                <tr key={e.id} data-testid={`latest-enquiry-${e.ref}`} className="border-t border-[#eef0f2]">
                  <td className="py-2.5 font-bold text-[#0f3d23]">{e.ref}</td>
                  <td className="py-2.5">{e.name}<span className="block text-[10.5px] text-[#6d8a63]">{e.phone}</span></td>
                  <td className="py-2.5">{e.items?.length || 0}</td>
                  <td className="py-2.5 font-semibold text-[#e4601f]">{inr(e.total)}</td>
                  <td className="py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold capitalize ${STATUS_COLORS[e.status] || ""}`}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
