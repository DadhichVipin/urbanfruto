import { useEffect, useMemo, useState } from "react";
import { Search, Ban, CheckCircle2 } from "lucide-react";
import { api, inr } from "@/lib/api";
import { toast } from "sonner";

export default function Customers() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/admin/customers").then((r) => setRows(r.data)).catch(() => toast.error("Load failed"));
  }, []);

  const shown = useMemo(() => {
    const t = q.toLowerCase().trim();
    if (!t) return rows;
    return rows.filter((r) => [r.name, r.phone, r.email, r.city].join(" ").toLowerCase().includes(t));
  }, [rows, q]);

  const toggle = async (id) => {
    const { data } = await api.patch(`/admin/customers/${id}`);
    setRows((prev) => prev.map((r) => (r.id === id ? data : r)));
    toast.success(data.blocked ? "Customer blocked" : "Customer unblocked");
  };

  return (
    <div data-testid="admin-customers">
      <h1 className="uf-display text-3xl font-bold text-[#0f3d23]">Users</h1>
      <p className="mt-1.5 text-[13px] text-[#6d8a63]">
        Captured automatically from storefront enquiries — {rows.length} total.
      </p>

      <div className="mt-5 flex max-w-[380px] items-center gap-2 rounded-xl border border-[#cfe3c6] bg-white px-3.5 py-2.5">
        <Search className="h-4 w-4 text-[#7e9b74]" />
        <input
          data-testid="customers-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, phone, city…"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="uf-card mt-5 overflow-x-auto p-4">
        <table className="w-full min-w-[720px] text-left text-[12.5px]">
          <thead className="text-[10.5px] uppercase tracking-wide text-[#6d8a63]">
            <tr>
              <th className="pb-2">Customer</th><th className="pb-2">Contact</th><th className="pb-2">City</th>
              <th className="pb-2">Orders</th><th className="pb-2">Lifetime Value</th><th className="pb-2">Last Order</th>
              <th className="pb-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((c) => (
              <tr key={c.id} data-testid={`customer-row-${c.phone}`} className="border-t border-[#e4efdd]">
                <td className="py-2.5">
                  <b className="block text-[13px] text-[#0f3d23]">{c.name}</b>
                  <span className="text-[10.5px] text-[#6d8a63]">Since {new Date(c.created_at).toLocaleDateString("en-IN")}</span>
                </td>
                <td className="py-2.5">{c.phone}<span className="block text-[10.5px] text-[#6d8a63]">{c.email || "—"}</span></td>
                <td className="py-2.5">{c.city || "—"} {c.pincode}</td>
                <td className="py-2.5 font-semibold">{c.orders}</td>
                <td className="py-2.5 font-semibold text-[#e4601f]">{inr(c.lifetime_value)}</td>
                <td className="py-2.5">{c.last_order_at ? new Date(c.last_order_at).toLocaleDateString("en-IN") : "—"}</td>
                <td className="py-2.5 text-right">
                  <button
                    data-testid={`customer-toggle-${c.phone}`}
                    onClick={() => toggle(c.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${
                      c.blocked ? "bg-[#ffe0e0] text-[#a33]" : "bg-[#ddefd4] text-[#2f7a46]"
                    }`}
                  >
                    {c.blocked ? <><Ban className="h-3.5 w-3.5" /> Blocked</> : <><CheckCircle2 className="h-3.5 w-3.5" /> Active</>}
                  </button>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-[#6d8a63]">No users yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
