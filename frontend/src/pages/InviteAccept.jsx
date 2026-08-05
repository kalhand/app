import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api, { formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Compass, Loader2, CheckCircle2, XCircle, Building2 } from "lucide-react";

export default function InviteAccept() {
  const { code } = useParams();
  const nav = useNavigate();
  const { setUser } = useAuth() || {}; // eslint-disable-line
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/invite/${code}`)
      .then((r) => setInvite(r.data))
      .catch((e) => setErr(formatApiErrorDetail(e.response?.data?.detail) || "Invalid invite"))
      .finally(() => setLoading(false));
  }, [code]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post(`/invite/${code}/accept`, form);
      localStorage.setItem("pf_token", data.token);
      toast.success(`Welcome, ${data.user.name}!`);
      // Full reload to hydrate AuthContext
      window.location.href = data.user.role === "university" ? "/university"
        : data.user.role === "principal" ? "/principal"
        : "/counselor";
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Could not accept invite");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center label-mono"><Loader2 className="animate-spin mr-2" /> Loading invite…</div>;
  }

  if (err || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card-brutal p-8 max-w-md w-full text-center">
          <XCircle size={40} strokeWidth={2.5} className="mx-auto text-red-700" />
          <h1 className="font-display text-2xl font-extrabold mt-3">Invite invalid</h1>
          <p className="text-sm text-[#52525B] mt-2">{err || "This invite code is not valid."}</p>
          <Link to="/login" className="btn-brutal bg-blue-600 text-white inline-flex items-center gap-2 px-4 py-2 mt-6">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-[#FEF08A] border-2 border-[#0A0A0A] rounded-xl flex items-center justify-center rotate-[-4deg]">
            <Compass strokeWidth={2.5} size={20} />
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight">PathfinderAiClub</span>
        </div>

        <div className="card-brutal p-8">
          <div className="inline-flex items-center gap-2 bg-[#A7F3D0] border-2 border-[#0A0A0A] rounded-full px-3 py-1">
            <CheckCircle2 size={14} strokeWidth={2.5} />
            <span className="label-mono">Valid invite</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold mt-4">Join {invite.school_name}</h1>
          <p className="text-sm text-[#52525B] mt-2">
            Your university has invited you to PathfinderAiClub as a <b className="capitalize">{invite.role}</b>.
            Set your password and get instant access.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 border-2 border-[#0A0A0A] rounded-full px-3 py-1 bg-[#FEF08A]">
            <Building2 size={12} strokeWidth={2.5} />
            <span className="label-mono">{invite.school_name}</span>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label-mono block mb-2">Your full name</label>
              <input data-testid="invite-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="label-mono block mb-2">Email</label>
              <input data-testid="invite-email" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="label-mono block mb-2">Set password</label>
              <input data-testid="invite-password" required type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" disabled={submitting} data-testid="invite-submit"
              className="btn-brutal bg-blue-600 text-white w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60">
              {submitting && <Loader2 className="animate-spin" size={16} />} Accept &amp; Sign In
            </button>
          </form>

          <p className="text-xs text-[#52525B] mt-4">This invite expires on {new Date(invite.expires_at).toLocaleDateString()}.</p>
        </div>
      </div>
    </div>
  );
}
