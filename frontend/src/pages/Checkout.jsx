import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Minus, Plus, Send, ShieldCheck, Trash2, Truck } from "lucide-react";
import { api, inr } from "@/lib/api";
import { useCart } from "@/store/CartContext";
import { toast } from "sonner";

const CITIES = ["Mumbai South", "Mumbai West", "Bengaluru", "Delhi NCR", "Pune"];

export default function Checkout() {
  const { items, total, setQty, remove, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", phone: "", email: "", pincode: "", city: CITIES[0], address: "", delivery_date: "", message: "",
  });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!items.length) return toast.error("Your bucket is empty");
    if (!/^[0-9+\-\s]{10,15}$/.test(form.phone.trim())) return toast.error("Enter a valid phone number");
    setSending(true);
    try {
      const { data } = await api.post("/enquiries", {
        ...form,
        total,
        source: "web-checkout",
        items: items.map((i) => ({
          kind: i.kind, item_id: i.item_id, name: i.name, price: i.price, qty: i.qty, meta: i.meta || "",
        })),
      });
      clear();
      setDone(data);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not send your enquiry");
    } finally {
      setSending(false);
    }
  };

  if (done)
    return (
      <div data-testid="checkout-success" className="uf-shell py-20 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#eef0f2]">
          <Check className="h-7 w-7 text-[#2f7a46]" />
        </span>
        <h1 className="uf-display mt-6 text-3xl font-bold text-[#0f3d23]">Enquiry Received</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-[#436a51]">
          Reference <b data-testid="enquiry-ref" className="text-[#e4601f]">{done.ref}</b>. Our curation desk will call
          you within 30 minutes to confirm your cold-chain delivery slot.
        </p>
        <p className="mt-2 text-xs text-[#6d8a63]">
          {done.notified ? "Our team has been notified on Slack." : "Saved to the admin dashboard — Slack webhook not configured yet."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/baskets" className="uf-btn-dark">Back to Baskets</Link>
          <Link to="/fruits" className="uf-btn-ghost">Build Another Bucket</Link>
        </div>
      </div>
    );

  return (
    <div data-testid="checkout-page" className="uf-shell py-10">
      <p className="uf-eyebrow text-[#6d8a63]">Final Step</p>
      <h1 className="uf-display mt-3 text-3xl font-bold text-[#0f3d23] sm:text-4xl">Review &amp; Place Your Order</h1>
      <p className="mt-3 max-w-xl text-sm text-[#436a51]">
        Confirm your bucket, share delivery details and our curation desk will reach out to lock your 3-hour slot.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <form onSubmit={submit} className="uf-card p-5 sm:p-6">
          <h2 className="uf-display text-lg font-bold">Delivery Details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              { k: "name", label: "Full Name *", type: "text", req: true, ph: "Ananya Roy" },
              { k: "phone", label: "WhatsApp / Phone *", type: "tel", req: true, ph: "+91 98XXXXXX10" },
              { k: "email", label: "Email", type: "email", req: false, ph: "you@email.com" },
              { k: "pincode", label: "Pincode", type: "text", req: false, ph: "400001" },
            ].map((f) => (
              <label key={f.k} className="block">
                <span className="text-[11.5px] font-semibold text-[#436a51]">{f.label}</span>
                <input
                  data-testid={`checkout-${f.k}`}
                  required={f.req}
                  type={f.type}
                  value={form[f.k]}
                  onChange={set(f.k)}
                  placeholder={f.ph}
                  className="mt-1.5 w-full rounded-xl border border-[#e2e4e8] bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[#0f3d23]"
                />
              </label>
            ))}

            <label className="block">
              <span className="text-[11.5px] font-semibold text-[#436a51]">Delivery City</span>
              <select
                data-testid="checkout-city"
                value={form.city}
                onChange={set("city")}
                className="mt-1.5 w-full rounded-xl border border-[#e2e4e8] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0f3d23]"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[11.5px] font-semibold text-[#436a51]">Preferred Date</span>
              <input
                data-testid="checkout-delivery-date"
                type="date"
                value={form.delivery_date}
                onChange={set("delivery_date")}
                className="mt-1.5 w-full rounded-xl border border-[#e2e4e8] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0f3d23]"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-[11.5px] font-semibold text-[#436a51]">Delivery Address</span>
              <textarea
                data-testid="checkout-address"
                rows={2}
                value={form.address}
                onChange={set("address")}
                placeholder="Flat, building, street, landmark"
                className="mt-1.5 w-full rounded-xl border border-[#e2e4e8] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0f3d23]"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-[11.5px] font-semibold text-[#436a51]">Gift Message / Notes</span>
              <textarea
                data-testid="checkout-message"
                rows={2}
                value={form.message}
                onChange={set("message")}
                placeholder="Handwritten card text, allergen swaps, fruit preferences..."
                className="mt-1.5 w-full rounded-xl border border-[#e2e4e8] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0f3d23]"
              />
            </label>
          </div>

          <button data-testid="checkout-submit" disabled={sending} className="uf-btn-orange mt-6 w-full disabled:opacity-60">
            {sending ? "Sending enquiry…" : <>Place Order Enquiry <Send className="h-4 w-4" /></>}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#6d8a63]">
            <ShieldCheck className="h-3.5 w-3.5" /> No payment now — we confirm on call before dispatch.
          </p>
        </form>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="uf-card p-5">
            <h2 className="uf-display text-lg font-bold">Your Bucket</h2>
            {items.length === 0 ? (
              <p data-testid="checkout-empty" className="mt-6 text-center text-sm text-[#6d8a63]">
                Nothing here yet.{" "}
                <button onClick={() => navigate("/baskets")} className="font-semibold text-[#e4601f]">Browse hampers</button>
              </p>
            ) : (
              <ul className="mt-4 grid gap-3">
                {items.map((i) => (
                  <li key={`${i.item_id}-${i.meta}`} data-testid={`checkout-item-${i.item_id}`} className="flex gap-3 border-b border-dashed border-[#e7e9ec] pb-3 last:border-0">
                    {i.image && <img src={i.image} alt={i.name} className="h-14 w-14 shrink-0 rounded-xl object-cover" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#0f3d23]">{i.name}</p>
                      <p className="text-[10.5px] text-[#6d8a63]">{i.meta || i.kind}</p>
                      <div className="mt-1.5 flex items-center gap-2.5">
                        <span className="flex items-center gap-2 rounded-full border border-[#e2e4e8] bg-white px-2 py-0.5">
                          <button onClick={() => setQty(i.item_id, i.meta, i.qty - 1)}><Minus className="h-3 w-3" /></button>
                          <b className="w-3 text-center text-[11px]">{i.qty}</b>
                          <button onClick={() => setQty(i.item_id, i.meta, i.qty + 1)}><Plus className="h-3 w-3" /></button>
                        </span>
                        <b className="text-[12.5px] text-[#e4601f]">{inr(i.price * i.qty)}</b>
                        <button onClick={() => remove(i.item_id, i.meta)} className="ml-auto text-[#9b7a63]">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <dl className="mt-5 grid gap-2 border-t border-[#e7e9ec] pt-4 text-[12px]">
              <div className="flex justify-between"><dt className="text-[#6d8a63]">Subtotal</dt><dd className="font-semibold">{inr(total)}</dd></div>
              <div className="flex justify-between"><dt className="text-[#6d8a63]">Cold-Chain Express Delivery</dt><dd className="font-semibold text-[#2f7a46]">FREE</dd></div>
              <div className="flex justify-between"><dt className="text-[#6d8a63]">Heirloom Wicker Packing</dt><dd className="font-semibold text-[#2f7a46]">Complimentary</dd></div>
              <div className="mt-1 flex items-baseline justify-between border-t border-[#e7e9ec] pt-3">
                <dt className="uf-display text-base font-bold">Total</dt>
                <dd data-testid="checkout-total" className="uf-display text-2xl font-black text-[#e4601f]">{inr(total)}</dd>
              </div>
            </dl>

            <p className="mt-4 flex items-center gap-2 rounded-xl bg-[#f5f6f7] p-3 text-[11px] text-[#436a51]">
              <Truck className="h-4 w-4 shrink-0 text-[#2f7a46]" />
              Dispatched within 180 minutes of confirmation under 4°C transit.
            </p>
          </div>

          <Link to="/fruits" className="uf-btn-ghost mt-4 w-full">
            Add more fruits <ArrowRight className="h-4 w-4" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
