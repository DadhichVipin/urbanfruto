import { useEffect, useState } from "react";
import { Save, Send } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const inputCls = "mt-1.5 w-full rounded-xl border border-[#cfe3c6] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0f3d23]";

export default function SettingsPage() {
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/admin/settings").then((r) => setS({ ...r.data, cities: (r.data?.cities || []).join(", ") })).catch(() => {});
  }, []);

  if (!s) return <p className="text-sm text-[#6d8a63]" data-testid="settings-loading">Loading settings…</p>;

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put("/admin/settings", {
        slack_webhook_url: s.slack_webhook_url || "",
        brand_phone: s.brand_phone || "",
        brand_email: s.brand_email || "",
        announcement: s.announcement || "",
        free_delivery_note: s.free_delivery_note || "",
        cities: String(s.cities || "").split(",").map((c) => c.trim()).filter(Boolean),
      });
      toast.success("Settings saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setBusy(false);
    }
  };

  const testSlack = async () => {
    try {
      await api.post("/admin/settings/test-slack");
      toast.success("Test message sent to Slack");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Slack test failed");
    }
  };

  return (
    <div data-testid="admin-settings">
      <h1 className="uf-display text-3xl font-bold text-[#0f3d23]">Settings</h1>
      <p className="mt-1.5 text-[13px] text-[#6d8a63]">Storefront content and Slack order notifications.</p>

      <form onSubmit={save} className="uf-card mt-5 max-w-[640px] p-5">
        <label className="block">
          <span className="text-[11.5px] font-semibold text-[#436a51]">Slack Incoming Webhook URL</span>
          <input
            data-testid="settings-slack-url"
            className={inputCls}
            placeholder="https://hooks.slack.com/services/…"
            value={s.slack_webhook_url || ""}
            onChange={(e) => setS({ ...s, slack_webhook_url: e.target.value })}
          />
          <span className="mt-1.5 block text-[11px] text-[#6d8a63]">
            Every new order enquiry is posted to this channel. Leave blank to only store enquiries in the dashboard.
          </span>
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-[11.5px] font-semibold text-[#436a51]">Brand Phone</span>
            <input data-testid="settings-phone" className={inputCls} value={s.brand_phone || ""} onChange={(e) => setS({ ...s, brand_phone: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-[11.5px] font-semibold text-[#436a51]">Brand Email</span>
            <input data-testid="settings-email" className={inputCls} value={s.brand_email || ""} onChange={(e) => setS({ ...s, brand_email: e.target.value })} />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-[11.5px] font-semibold text-[#436a51]">Announcement Bar Text</span>
          <textarea data-testid="settings-announcement" rows={2} className={inputCls} value={s.announcement || ""} onChange={(e) => setS({ ...s, announcement: e.target.value })} />
        </label>

        <label className="mt-4 block">
          <span className="text-[11.5px] font-semibold text-[#436a51]">Delivery Cities (comma separated)</span>
          <input data-testid="settings-cities" className={inputCls} value={s.cities || ""} onChange={(e) => setS({ ...s, cities: e.target.value })} />
        </label>

        <label className="mt-4 block">
          <span className="text-[11.5px] font-semibold text-[#436a51]">Free Delivery Note</span>
          <input data-testid="settings-delivery-note" className={inputCls} value={s.free_delivery_note || ""} onChange={(e) => setS({ ...s, free_delivery_note: e.target.value })} />
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <button data-testid="settings-save" disabled={busy} className="uf-btn-dark disabled:opacity-60">
            <Save className="h-4 w-4" /> Save Settings
          </button>
          <button type="button" data-testid="settings-test-slack" onClick={testSlack} className="uf-btn-ghost">
            <Send className="h-4 w-4" /> Send Slack Test
          </button>
        </div>
      </form>
    </div>
  );
}
