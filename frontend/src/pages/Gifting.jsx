import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Building2, Check, FileText, Gift, Mail, Send, Snowflake, Truck, Users,
} from "lucide-react";
import { api, inr } from "@/lib/api";
import { toast } from "sonner";

const TIERS = [
  { id: "starter", label: "Starter", range: "25 – 49 hampers", discount: 8, perks: ["Co-branded greeting card", "Single-address delivery", "Dedicated account manager"] },
  { id: "growth", label: "Growth", range: "50 – 149 hampers", discount: 14, perks: ["Custom ribbon & muslin lining", "Multi-address dispatch", "Priority 3-hour slots"], popular: true },
  { id: "enterprise", label: "Enterprise", range: "150+ hampers", discount: 22, perks: ["Fully bespoke wooden chests", "Pan-India cold-chain dispatch", "Quarterly gifting calendar"] },
];

const inputCls = "mt-1.5 w-full rounded-xl border border-[#cfe3c6] bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[#0f3d23]";

export default function Gifting() {
  const [hampers, setHampers] = useState([]);
  const [tierId, setTierId] = useState("growth");
  const [form, setForm] = useState({
    name: "", company: "", phone: "", email: "", city: "", quantity: 50, hamper: "", delivery_date: "", message: "",
  });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    api.get("/hampers").then((r) => {
      setHampers(r.data);
      setForm((f) => ({ ...f, hamper: f.hamper || r.data[0]?.slug || "" }));
    }).catch(() => {});
  }, []);

  const tier = TIERS.find((t) => t.id === tierId);
  const selected = useMemo(() => hampers.find((h) => h.slug === form.hamper), [hampers, form.hamper]);

  const qty = Math.max(1, Number(form.quantity) || 0);
  const unit = selected ? Math.round(selected.price * (1 - tier.discount / 100)) : 0;
  const estimate = unit * qty;
  const saved = selected ? selected.price * qty - estimate : 0;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!/^[0-9+\-\s]{10,15}$/.test(form.phone.trim())) return toast.error("Enter a valid phone number");
    setSending(true);
    try {
      const { data } = await api.post("/enquiries", {
        name: form.name,
        phone: form.phone,
        email: form.email,
        city: form.city,
        pincode: "",
        address: form.company ? `Company: ${form.company}` : "",
        delivery_date: form.delivery_date,
        message: `[CORPORATE QUOTE] Tier: ${tier.label} (${tier.discount}% off) · ${qty} × ${selected?.name || "hamper"} · ${form.message || "no notes"}`,
        source: "corporate-quote",
        total: estimate,
        items: [{
          kind: "quote",
          item_id: selected?.id || "corporate",
          name: `${selected?.name || "Corporate Hamper"} — ${tier.label} bulk tier`,
          price: unit,
          qty,
          meta: `${tier.discount}% bulk discount · ${tier.range}`,
        }],
      });
      setDone(data);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not send your request");
    } finally {
      setSending(false);
    }
  };

  if (done)
    return (
      <div data-testid="gifting-success" className="uf-shell py-20 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#ddefd4]">
          <Check className="h-7 w-7 text-[#2f7a46]" />
        </span>
        <h1 className="uf-display mt-6 text-3xl font-bold text-[#0f3d23]">Quote Request Received</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-[#436a51]">
          Reference <b data-testid="gifting-ref" className="text-[#e4601f]">{done.ref}</b>. Our corporate desk will
          send your formal quotation within one business day.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/baskets" className="uf-btn-dark">Browse Baskets</Link>
          <Link to="/" className="uf-btn-ghost">Back to Home</Link>
        </div>
      </div>
    );

  return (
    <div data-testid="gifting-page" className="bg-[#eaf6e4]">
      {/* HERO */}
      <section className="uf-shell pt-10">
        <span className="uf-chip"><Building2 className="h-3.5 w-3.5 text-[#2f7a46]" /> Corporate &amp; Bulk Gifting</span>
        <h1 className="uf-display mt-4 max-w-2xl text-3xl font-black leading-[1.05] text-[#0f3d23] sm:text-4xl lg:text-5xl">
          Prestige Fruit Hampers, Dispatched at Scale
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#436a51] md:text-base">
          Diwali, onboarding kits, client milestones and board gifting — hand-assembled artisanal hampers delivered
          across Mumbai, Delhi, Bengaluru and Pune under strict 4°C cold chain, with bulk pricing from 25 units.
        </p>
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Users, t: "25 → 5,000", s: "Units per dispatch" },
            { icon: Truck, t: "Multi-Address", s: "Pan-India delivery" },
            { icon: Snowflake, t: "4°C Cold-Chain", s: "Zero bruising promise" },
            { icon: FileText, t: "GST Invoice", s: "Formal quotation" },
          ].map(({ icon: Icon, t, s }) => (
            <div key={t} className="uf-card min-w-0 p-3.5">
              <Icon className="h-4 w-4 text-[#e4601f]" />
              <b className="mt-2.5 block truncate text-[12.5px] text-[#0f3d23]">{t}</b>
              <span className="block truncate text-[10px] text-[#6d8a63]">{s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* TIERS */}
      <section className="uf-shell mt-14">
        <p className="uf-eyebrow text-[#6d8a63]">Volume Pricing</p>
        <h2 className="uf-display mt-3 text-3xl font-bold text-[#0f3d23] sm:text-4xl">Bulk Pricing Tiers</h2>
        <p className="mt-3 max-w-xl text-sm text-[#436a51] md:text-base">
          Discounts apply to every hamper in the order and stack with complimentary wicker packing and delivery.
        </p>

        <div data-testid="tier-grid" className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {TIERS.map((t) => (
            <button
              key={t.id}
              data-testid={`tier-${t.id}`}
              onClick={() => setTierId(t.id)}
              className={`relative flex min-w-0 flex-col rounded-2xl border bg-[#fcfdf8] p-5 text-left transition-all duration-300 hover:-translate-y-1 ${
                tierId === t.id ? "border-[#e4601f] shadow-[0_22px_44px_-28px_rgba(15,61,35,0.5)]" : "border-[#d8e8d0]"
              }`}
            >
              {t.popular && (
                <span className="absolute -top-3 left-5 rounded-full bg-[#e4601f] px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                  Most Chosen
                </span>
              )}
              <p className="uf-eyebrow text-[#6d8a63]">{t.label}</p>
              <b className="uf-display mt-2 block text-3xl font-black text-[#0f3d23]">{t.discount}% off</b>
              <span className="mt-1 text-[12px] font-semibold text-[#e4601f]">{t.range}</span>
              <ul className="mt-4 grid gap-2">
                {t.perks.map((p) => (
                  <li key={p} className="flex items-start gap-1.5 text-[12px] leading-snug text-[#436a51]">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#2f7a46]" /> {p}
                  </li>
                ))}
              </ul>
              <span className={`mt-5 inline-flex items-center gap-1.5 text-[11.5px] font-bold ${tierId === t.id ? "text-[#e4601f]" : "text-[#0f3d23]"}`}>
                {tierId === t.id ? "Selected for your quote" : "Select this tier"} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* QUOTE FORM */}
      <section className="uf-shell mt-14 pb-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <form onSubmit={submit} className="uf-card min-w-0 p-5 sm:p-6">
            <p className="uf-eyebrow text-[#e4601f]">Request a Quote</p>
            <h2 className="uf-display mt-2 text-2xl font-bold text-[#0f3d23]">Tell us about your gifting</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11.5px] font-semibold text-[#436a51]">Contact Name *</span>
                <input data-testid="gifting-name" required className={inputCls} value={form.name} onChange={set("name")} placeholder="Vikram Mehta" />
              </label>
              <label className="block">
                <span className="text-[11.5px] font-semibold text-[#436a51]">Company</span>
                <input data-testid="gifting-company" className={inputCls} value={form.company} onChange={set("company")} placeholder="Elevate VC" />
              </label>
              <label className="block">
                <span className="text-[11.5px] font-semibold text-[#436a51]">Phone *</span>
                <input data-testid="gifting-phone" required type="tel" className={inputCls} value={form.phone} onChange={set("phone")} placeholder="+91 98XXXXXX10" />
              </label>
              <label className="block">
                <span className="text-[11.5px] font-semibold text-[#436a51]">Work Email</span>
                <input data-testid="gifting-email" type="email" className={inputCls} value={form.email} onChange={set("email")} placeholder="you@company.com" />
              </label>
              <label className="block">
                <span className="text-[11.5px] font-semibold text-[#436a51]">Delivery City</span>
                <input data-testid="gifting-city" className={inputCls} value={form.city} onChange={set("city")} placeholder="Mumbai, Bengaluru" />
              </label>
              <label className="block">
                <span className="text-[11.5px] font-semibold text-[#436a51]">Target Date</span>
                <input data-testid="gifting-date" type="date" className={inputCls} value={form.delivery_date} onChange={set("delivery_date")} />
              </label>
              <label className="block">
                <span className="text-[11.5px] font-semibold text-[#436a51]">Hamper</span>
                <select data-testid="gifting-hamper" className={inputCls} value={form.hamper} onChange={set("hamper")}>
                  {hampers.map((h) => (
                    <option key={h.slug} value={h.slug}>{h.name} — {inr(h.price)}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[11.5px] font-semibold text-[#436a51]">Quantity *</span>
                <input data-testid="gifting-quantity" required type="number" min="1" className={inputCls} value={form.quantity} onChange={set("quantity")} />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-[11.5px] font-semibold text-[#436a51]">Requirements / Branding Notes</span>
                <textarea data-testid="gifting-message" rows={3} className={inputCls} value={form.message} onChange={set("message")} placeholder="Logo on card, multi-address split, invoice details..." />
              </label>
            </div>

            <button data-testid="gifting-submit" disabled={sending} className="uf-btn-orange mt-6 w-full disabled:opacity-60">
              {sending ? "Sending request…" : <>Request Corporate Quote <Send className="h-4 w-4" /></>}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#6d8a63]">
              <Mail className="h-3.5 w-3.5" /> No payment now — we send a formal quotation first.
            </p>
          </form>

          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="uf-card min-w-0 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="uf-eyebrow text-[#e4601f]">Live Estimate</p>
                  <h3 className="uf-display mt-1 text-xl font-bold leading-tight text-[#0f3d23]">Your Bulk Quote</h3>
                </div>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eef8e8]">
                  <Gift className="h-4 w-4 text-[#2f7a46]" />
                </span>
              </div>

              {selected && (
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#eef8e8] p-3">
                  <img src={selected.image} alt={selected.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                  <span className="min-w-0 leading-tight">
                    <b className="block truncate text-[12.5px] text-[#0f3d23]">{selected.name}</b>
                    <span className="text-[10.5px] text-[#6d8a63]">{selected.weight} · {selected.varieties} Varieties</span>
                  </span>
                </div>
              )}

              <dl className="mt-4 grid gap-2 text-[12px]">
                <div className="flex justify-between"><dt className="text-[#6d8a63]">Tier</dt><dd className="font-semibold">{tier.label} ({tier.range})</dd></div>
                <div className="flex justify-between"><dt className="text-[#6d8a63]">List price / hamper</dt><dd className="font-semibold">{inr(selected?.price || 0)}</dd></div>
                <div className="flex justify-between"><dt className="text-[#6d8a63]">Your price / hamper</dt><dd data-testid="gifting-unit-price" className="font-semibold text-[#2f7a46]">{inr(unit)}</dd></div>
                <div className="flex justify-between"><dt className="text-[#6d8a63]">Quantity</dt><dd className="font-semibold">{qty} hampers</dd></div>
                <div className="flex justify-between"><dt className="text-[#6d8a63]">Delivery &amp; wicker packing</dt><dd className="font-semibold text-[#2f7a46]">Complimentary</dd></div>
                <div className="mt-1 flex items-baseline justify-between border-t border-[#d8e8d0] pt-3">
                  <dt className="uf-display text-base font-bold">Estimate</dt>
                  <dd data-testid="gifting-estimate" className="uf-display text-2xl font-black text-[#e4601f]">{inr(estimate)}</dd>
                </div>
              </dl>

              <p data-testid="gifting-savings" className="mt-4 rounded-xl bg-[#ddefd4] p-3 text-[11.5px] font-semibold text-[#2f7a46]">
                You save {inr(saved)} at the {tier.label} tier ({tier.discount}% off).
              </p>
              <p className="mt-2 text-[10.5px] text-[#6d8a63]">
                Indicative estimate excluding GST. Final quotation confirmed by our corporate desk.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
