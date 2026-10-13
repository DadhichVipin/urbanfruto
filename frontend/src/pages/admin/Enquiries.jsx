import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { api, inr } from "@/lib/api";
import { toast } from "sonner";

const STATUSES = ["new", "contacted", "confirmed", "delivered", "cancelled"];
const COLORS = {
  new: "bg-[#ffe6d6] text-[#c04d13]",
  contacted: "bg-[#ddefd4] text-[#2f7a46]",
  confirmed: "bg-[#d6e9ff] text-[#1a4f91]",
  delivered: "bg-[#e3e3ff] text-[#3b3b8f]",
  cancelled: "bg-[#ffe0e0] text-[#a33]",
};

export default function Enquiries() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);

  const load = () => api.get("/admin/enquiries").then((r) => setRows(r.data)).catch(() => toast.error("Load failed"));
  useEffect(() => { load(); }, []);

  const shown = useMemo(() => (filter === "all" ? rows : rows.filter((r) => r.status === filter)), [rows, filter]);

  const setStatus = async (id, status) => {
    await api.patch(`/admin/enquiries/${id}`, { status });
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(`Marked ${status}`);
  };

  const remove = async (id) => {
    await api.delete(`/admin/enquiries/${id}`);
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Enquiry deleted");
  };

  return (
    <div data-testid="admin-enquiries">
      <h1 className="uf-display text-3xl font-bold text-[#0f3d23]">Enquiries History</h1>
      <p className="mt-1.5 text-[13px] text-[#6d8a63]">Every order enquiry placed from the storefront, newest first.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            data-testid={`enquiry-filter-${s}`}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold capitalize ${
              filter === s ? "bg-[#0f3d23] text-[#f3fbee]" : "border border-[#cfe3c6] bg-white text-[#436a51]"
            }`}
          >
            {s} ({s === "all" ? rows.length : rows.filter((r) => r.status === s).length})
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3">
        {shown.length === 0 && (
          <p data-testid="enquiries-empty" className="uf-card p-8 text-center text-sm text-[#6d8a63]">
            No enquiries in this view yet.
          </p>
        )}
        {shown.map((e) => (
          <div key={e.id} data-testid={`enquiry-card-${e.ref}`} className="uf-card p-4">
            <div className="flex flex-wrap items-center gap-3">
              <b className="uf-display text-base font-bold text-[#0f3d23]">{e.ref}</b>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${COLORS[e.status] || ""}`}>
                {e.status}
              </span>
              <span className="text-[11.5px] text-[#6d8a63]">{new Date(e.created_at).toLocaleString("en-IN")}</span>
              <b className="ml-auto text-[14px] text-[#e4601f]">{inr(e.total)}</b>
            </div>

            <div className="mt-3 grid gap-2 text-[12.5px] sm:grid-cols-3">
              <p><span className="text-[#6d8a63]">Customer: </span><b>{e.name}</b></p>
              <p><span className="text-[#6d8a63]">Phone: </span>{e.phone}</p>
              <p><span className="text-[#6d8a63]">City: </span>{e.city || "—"} {e.pincode}</p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select
                data-testid={`enquiry-status-${e.ref}`}
                value={e.status}
                onChange={(ev) => setStatus(e.id, ev.target.value)}
                className="rounded-lg border border-[#cfe3c6] bg-white px-3 py-1.5 text-[12px] capitalize outline-none"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button
                data-testid={`enquiry-expand-${e.ref}`}
                onClick={() => setOpenId(openId === e.id ? null : e.id)}
                className="flex items-center gap-1.5 rounded-lg border border-[#cfe3c6] bg-white px-3 py-1.5 text-[12px] font-semibold"
              >
                {e.items?.length || 0} items
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openId === e.id ? "rotate-180" : ""}`} />
              </button>
              <span className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${e.notified ? "bg-[#ddefd4] text-[#2f7a46]" : "bg-[#f1efe4] text-[#7a6c4a]"}`}>
                {e.notified ? "Slack notified" : "Slack pending"}
              </span>
              <button
                data-testid={`enquiry-delete-${e.ref}`}
                onClick={() => remove(e.id)}
                className="ml-auto grid h-8 w-8 place-items-center rounded-lg border border-[#f0cfc4] bg-white text-[#c04d13]"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {openId === e.id && (
              <div data-testid={`enquiry-details-${e.ref}`} className="mt-3 rounded-xl bg-[#eef8e8] p-3.5">
                <ul className="grid gap-1.5 text-[12px]">
                  {(e.items || []).map((i, idx) => (
                    <li key={idx} className="flex justify-between gap-3">
                      <span>{i.name} <span className="text-[#6d8a63]">× {i.qty} {i.meta ? `· ${i.meta}` : ""}</span></span>
                      <b className="shrink-0">{inr(i.price * i.qty)}</b>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[12px]"><span className="text-[#6d8a63]">Address: </span>{e.address || "—"}</p>
                <p className="mt-1 text-[12px]"><span className="text-[#6d8a63]">Preferred date: </span>{e.delivery_date || "Earliest slot"}</p>
                <p className="mt-1 text-[12px]"><span className="text-[#6d8a63]">Note: </span>{e.message || "—"}</p>
                <p className="mt-1 text-[12px]"><span className="text-[#6d8a63]">Email: </span>{e.email || "—"}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
