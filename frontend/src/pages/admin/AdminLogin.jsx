import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { Logo } from "@/components/site/Header";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const { data } = await api.post("/admin/login", { email, password });
      localStorage.setItem("uf_admin_token", data.token);
      localStorage.setItem("uf_admin_email", data.admin.email);
      navigate("/admin");
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="admin-login-page" className="grid min-h-screen place-items-center bg-[#0f3d23] px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex justify-center rounded-2xl bg-[#f3fbee] p-4">
          <Logo />
        </div>
        <form onSubmit={submit} className="rounded-2xl bg-[#f3fbee] p-6">
          <h1 className="uf-display text-2xl font-bold text-[#0f3d23]">Admin Console</h1>
          <p className="mt-1.5 text-[12.5px] text-[#6d8a63]">Manage inventory, enquiries and customers.</p>

          <label className="mt-6 block">
            <span className="text-[11.5px] font-semibold text-[#436a51]">Email</span>
            <span className="mt-1.5 flex items-center gap-2 rounded-xl border border-[#cfe3c6] bg-white px-3.5 py-2.5">
              <Mail className="h-4 w-4 text-[#7e9b74]" />
              <input
                data-testid="admin-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@urbanfruto.com"
                className="w-full bg-transparent text-sm outline-none"
              />
            </span>
          </label>

          <label className="mt-4 block">
            <span className="text-[11.5px] font-semibold text-[#436a51]">Password</span>
            <span className="mt-1.5 flex items-center gap-2 rounded-xl border border-[#cfe3c6] bg-white px-3.5 py-2.5">
              <Lock className="h-4 w-4 text-[#7e9b74]" />
              <input
                data-testid="admin-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-sm outline-none"
              />
            </span>
          </label>

          {err && (
            <p data-testid="admin-login-error" className="mt-4 rounded-lg bg-[#ffe6e0] px-3 py-2 text-[12px] font-medium text-[#b03a1a]">
              {err}
            </p>
          )}

          <button data-testid="admin-login-submit" disabled={busy} className="uf-btn-dark mt-6 w-full disabled:opacity-60">
            {busy ? "Signing in…" : <>Sign In <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
