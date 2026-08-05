import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { Users, ListChecks, FileText, ArrowRight, Globe2, Plus, Copy, Loader2 } from "lucide-react";
import InviteButton from "@/components/InviteButton";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, questions: 0, assessments: 0 });
  const [universities, setUniversities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", organization_name: "" });
  const [saving, setSaving] = useState(false);
  const [justCreated, setJustCreated] = useState(null);

  const loadAll = () => {
    api.get("/admin/stats").then((r) => setStats(r.data));
    api.get("/admin/universities").then((r) => setUniversities(r.data));
  };
  useEffect(() => { loadAll(); }, []);

  const cards = [
    { k: "users", label: "Students", icon: Users, color: "bg-[#A7F3D0]", to: "/admin/results" },
    { k: "questions", label: "Questions", icon: ListChecks, color: "bg-[#FEF08A]", to: "/admin/questions" },
    { k: "assessments", label: "Assessments", icon: FileText, color: "bg-[#E9D5FF]", to: "/admin/results" },
  ];

  const create = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { toast.error("Name and email are required"); return; }
    setSaving(true);
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ""));
      const { data } = await api.post("/admin/universities", payload);
      setJustCreated(data);
      toast.success("University login created");
      setForm({ name: "", email: "", password: "", organization_name: "" });
      setShowForm(false);
      loadAll();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to create");
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <span className="label-mono">Admin</span>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">Control Center</h1>
        <p className="text-[#52525B] mt-2">Manage the question bank, review assessments, and provision universities.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {cards.map((c) => (
            <Link key={c.k} to={c.to} data-testid={`admin-stat-${c.k}`} className={`card-brutal p-8 ${c.color} hover:-translate-y-1 transition-transform`}>
              <c.icon strokeWidth={2.5} size={28} />
              <div className="label-mono mt-4">{c.label}</div>
              <div className="font-display text-5xl font-extrabold tracking-tight mt-2">{stats[c.k]}</div>
              <div className="mt-4 text-sm font-semibold flex items-center gap-1">Manage <ArrowRight size={14} strokeWidth={2.5} /></div>
            </Link>
          ))}
        </div>

        {/* Universities */}
        <div className="mt-14">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <span className="label-mono flex items-center gap-2"><Globe2 size={14} strokeWidth={2.5} /> Universities</span>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight mt-1">Provision super-admin logins</h2>
            </div>
            <button onClick={() => setShowForm((v) => !v)} data-testid="admin-new-univ-btn" className="btn-brutal bg-blue-600 text-white px-4 py-2 text-sm flex items-center gap-2">
              <Plus size={14} strokeWidth={2.5} /> Add University
            </button>
          </div>

          <div className="mb-6">
            <InviteButton endpoint="/admin/invites" role="university" label="Invite University via one-tap link" testId="admin-invite-univ-btn" />
          </div>

          {showForm && (
            <form onSubmit={create} className="card-brutal p-6 mb-6 bg-[#FEF08A] space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input data-testid="admin-univ-name" required placeholder="Contact name (e.g. Dr. R. Singh)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input data-testid="admin-univ-org" placeholder="Organization name (e.g. Panjab University)" value={form.organization_name} onChange={(e) => setForm({ ...form, organization_name: e.target.value })} className="px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input data-testid="admin-univ-email" required type="email" placeholder="Login email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input data-testid="admin-univ-password" type="text" placeholder="Password (blank = auto-generate)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-brutal bg-white px-4 py-2 text-sm">Cancel</button>
                <button type="submit" disabled={saving} data-testid="admin-univ-save" className="btn-brutal bg-blue-600 text-white px-4 py-2 text-sm flex items-center gap-2">
                  {saving ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} strokeWidth={2.5} />} Create
                </button>
              </div>
            </form>
          )}

          {justCreated && (
            <div className="card-brutal p-5 mb-6 bg-[#A7F3D0]">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <div className="label-mono">Save these credentials — they won't be shown again</div>
                  <div className="mt-2 text-sm">Email: <b>{justCreated.email}</b> · Password: <b className="font-mono">{justCreated.temp_password}</b></div>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(`${justCreated.email},${justCreated.temp_password}`); toast.success("Copied"); }}
                  className="btn-brutal bg-white px-3 py-2 text-xs flex items-center gap-1"
                >
                  <Copy size={12} strokeWidth={2.5} /> Copy
                </button>
              </div>
            </div>
          )}

          <div className="card-brutal overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FEF08A] border-b-2 border-[#0A0A0A]">
                <tr>
                  <th className="text-left px-4 py-3 label-mono">Organization</th>
                  <th className="text-left px-4 py-3 label-mono">Contact</th>
                  <th className="text-left px-4 py-3 label-mono">Email</th>
                  <th className="text-left px-4 py-3 label-mono">Schools</th>
                </tr>
              </thead>
              <tbody>
                {universities.length === 0 ? (
                  <tr><td colSpan="4" className="px-4 py-6 text-[#52525B]">No universities yet.</td></tr>
                ) : universities.map((u) => (
                  <tr key={u.id} data-testid={`admin-univ-row-${u.id}`} className="border-b border-[#0A0A0A]/10">
                    <td className="px-4 py-3 font-semibold">{u.organization_name || u.name}</td>
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3 text-[#52525B]">{u.email}</td>
                    <td className="px-4 py-3">{u.school_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
