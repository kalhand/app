import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { formatApiErrorDetail } from "@/lib/api";
import { BOARDS } from "@/lib/nep";
import { toast } from "sonner";
import { Plus, X, Save, Loader2, Building2, Users, Sparkles, Copy, ChevronDown, ChevronUp, Ticket } from "lucide-react";

const emptyForm = {
  name: "", city: "", state: "", board: "",
  principal_name: "", principal_email: "", principal_password: "",
  counselor_name: "", counselor_email: "", counselor_password: "",
};

export default function UniversitySchools() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [justCreated, setJustCreated] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [inviteFor, setInviteFor] = useState(null); // school object
  const [inviteRole, setInviteRole] = useState("principal");
  const [inviteData, setInviteData] = useState(null);
  const [inviteBusy, setInviteBusy] = useState(false);

  const inviteBase = `${window.location.origin}/invite/`;

  const openInvite = (school) => {
    setInviteFor(school);
    setInviteData(null);
    setInviteRole("principal");
  };

  const generateInvite = async () => {
    if (!inviteFor) return;
    setInviteBusy(true);
    try {
      const { data } = await api.post("/university/invites", { school_id: inviteFor.id, role: inviteRole });
      setInviteData(data);
      toast.success("Invite code generated");
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Could not create invite");
    } finally {
      setInviteBusy(false);
    }
  };

  const copyInvite = () => {
    if (!inviteData) return;
    navigator.clipboard.writeText(`${inviteBase}${inviteData.code}`);
    toast.success("Invite link copied");
  };

  const load = () => {
    setLoading(true);
    api.get("/university/schools").then((r) => setItems(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("School name is required"); return; }
    setSaving(true);
    try {
      const { data } = await api.post("/university/schools", form);
      toast.success(`Added ${data.school.name}`);
      setJustCreated(data);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to create school");
    } finally {
      setSaving(false);
    }
  };

  const copyCreds = (accts) => {
    if (!accts?.length) return;
    const csv = "email,role,temp_password\n" +
      accts.filter((a) => a.status === "created")
           .map((a) => `${a.email},${a.role},${a.temp_password}`).join("\n");
    navigator.clipboard.writeText(csv);
    toast.success("Credentials copied");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="label-mono">University · Schools</span>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">Manage schools</h1>
            <p className="text-[#52525B] mt-2">Add a school and generate access for its principal and counselor.</p>
          </div>
          <button onClick={() => setShowForm(true)} data-testid="univ-new-school-btn" className="btn-brutal bg-blue-600 text-white px-5 py-3 flex items-center gap-2">
            <Plus size={16} strokeWidth={2.5} /> Add School
          </button>
        </div>

        {/* Just-created creds banner */}
        {justCreated && justCreated.accounts?.some((a) => a.status === "created") && (
          <div className="mt-6 card-brutal p-5 bg-[#FEF08A]">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div>
                <div className="label-mono">Save these credentials — they won't be shown again</div>
                <h3 className="font-display text-lg font-extrabold mt-1">Access for {justCreated.school.name}</h3>
              </div>
              <button onClick={() => copyCreds(justCreated.accounts)} className="btn-brutal bg-white px-3 py-2 text-sm flex items-center gap-1">
                <Copy size={14} strokeWidth={2.5} /> Copy CSV
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className="label-mono">Email</div>
              <div className="label-mono">Role</div>
              <div className="label-mono">Temp password</div>
              {justCreated.accounts.filter((a) => a.status === "created").map((a, i) => (
                <>
                  <div key={`e${i}`}>{a.email}</div>
                  <div key={`r${i}`} className="capitalize">{a.role}</div>
                  <div key={`p${i}`} className="font-mono">{a.temp_password}</div>
                </>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          {loading ? (
            <div className="label-mono">Loading…</div>
          ) : items.length === 0 ? (
            <div className="card-brutal p-10 text-center bg-white text-sm text-[#52525B]" data-testid="univ-schools-empty">
              No schools yet. Add your first school above.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {items.map((s) => (
                <div key={s.id} data-testid={`univ-school-${s.id}`} className="card-brutal p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2"><Building2 strokeWidth={2.5} size={18} /><h3 className="font-display text-xl font-bold">{s.name}</h3></div>
                      <div className="text-xs text-[#52525B] mt-1">{[s.city, s.state, s.board].filter(Boolean).join(" · ") || "No location set"}</div>
                    </div>
                    <span className="text-xs px-2 py-1 border-2 border-[#0A0A0A] rounded-full bg-[#E9D5FF]">{s.staff?.length || 0} staff</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="border-2 border-[#0A0A0A] rounded-xl p-3 bg-[#A7F3D0]">
                      <div className="label-mono flex items-center gap-1"><Users size={12} strokeWidth={2.5} /> Students</div>
                      <div className="font-display text-2xl font-extrabold mt-1">{s.student_count}</div>
                    </div>
                    <div className="border-2 border-[#0A0A0A] rounded-xl p-3 bg-[#FEF08A]">
                      <div className="label-mono flex items-center gap-1"><Sparkles size={12} strokeWidth={2.5} /> Assessments</div>
                      <div className="font-display text-2xl font-extrabold mt-1">{s.assessment_count}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setExpanded((p) => ({ ...p, [s.id]: !p[s.id] }))}
                      className="text-sm font-semibold flex items-center gap-1"
                    >
                      Staff accounts {expanded[s.id] ? <ChevronUp size={14} strokeWidth={2.5} /> : <ChevronDown size={14} strokeWidth={2.5} />}
                    </button>
                    <button
                      data-testid={`univ-invite-btn-${s.id}`}
                      onClick={() => openInvite(s)}
                      className="btn-brutal bg-[#FEF08A] px-3 py-1.5 text-xs flex items-center gap-1 ml-auto"
                    >
                      <Ticket size={12} strokeWidth={2.5} /> Generate invite
                    </button>
                  </div>
                  {expanded[s.id] && (
                    <ul className="mt-2 space-y-1 text-xs">
                      {(s.staff || []).length === 0 ? <li className="text-[#52525B]">No staff accounts yet.</li> :
                        s.staff.map((st, i) => (
                          <li key={i} className="flex justify-between border-b border-[#0A0A0A]/10 py-1.5">
                            <span>{st.name}</span>
                            <span className="text-[#52525B]">{st.email} · {st.role}</span>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invite modal */}
      {inviteFor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setInviteFor(null)}>
          <div onClick={(e) => e.stopPropagation()} className="card-brutal bg-white p-6 md:p-8 max-w-lg w-full">
            <div className="flex items-center justify-between">
              <div>
                <span className="label-mono flex items-center gap-1"><Ticket size={12} strokeWidth={2.5} /> One-tap invite</span>
                <h2 className="font-display text-2xl font-extrabold mt-1">Invite staff to {inviteFor.name}</h2>
              </div>
              <button onClick={() => setInviteFor(null)} data-testid="invite-modal-close" className="p-2 border-2 border-[#0A0A0A] rounded-lg"><X size={16} strokeWidth={2.5} /></button>
            </div>

            <div className="mt-5 flex gap-2">
              {["principal", "counselor"].map((r) => (
                <button
                  key={r}
                  type="button"
                  data-testid={`invite-role-${r}`}
                  onClick={() => { setInviteRole(r); setInviteData(null); }}
                  className={`px-3 py-1.5 border-2 border-[#0A0A0A] rounded-full text-sm font-semibold capitalize ${inviteRole === r ? "bg-[#0A0A0A] text-white" : "bg-white"}`}
                >
                  {r}
                </button>
              ))}
            </div>

            {!inviteData ? (
              <button
                onClick={generateInvite}
                disabled={inviteBusy}
                data-testid="invite-generate-btn"
                className="btn-brutal bg-blue-600 text-white w-full py-3 mt-6 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {inviteBusy ? <Loader2 className="animate-spin" size={16} /> : <Ticket size={16} strokeWidth={2.5} />}
                Generate one-tap invite
              </button>
            ) : (
              <div className="mt-6">
                <div className="border-2 border-[#0A0A0A] rounded-xl p-4 bg-[#FEF08A]">
                  <div className="label-mono">Share this link with the {inviteData.role}</div>
                  <div data-testid="invite-link" className="font-mono text-sm mt-2 break-all">
                    {inviteBase}{inviteData.code}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={copyInvite} className="btn-brutal bg-white px-3 py-2 text-sm flex items-center gap-1">
                      <Copy size={14} strokeWidth={2.5} /> Copy link
                    </button>
                    <span className="label-mono self-center">Expires {new Date(inviteData.expires_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="text-xs text-[#52525B] mt-3">
                  No email or password needed — the invitee opens the link, sets their own password, and lands directly in their role's dashboard.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="card-brutal bg-white p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-extrabold">Add new school</h2>
              <button onClick={() => setShowForm(false)} className="p-2 border-2 border-[#0A0A0A] rounded-lg"><X size={16} strokeWidth={2.5} /></button>
            </div>
            <form onSubmit={save} className="mt-6 space-y-4">
              <div>
                <label className="label-mono block mb-2">School name</label>
                <input data-testid="univ-form-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="label-mono block mb-2">City</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="label-mono block mb-2">State</label>
                  <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="label-mono block mb-2">Board</label>
                  <select value={form.board} onChange={(e) => setForm({ ...form, board: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none">
                    <option value="">—</option>
                    {BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <div className="label-mono">Grant access (optional)</div>
                <p className="text-xs text-[#52525B] mt-1">Leave password blank to auto-generate.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input placeholder="Principal name" value={form.principal_name} onChange={(e) => setForm({ ...form, principal_name: e.target.value })}
                  className="px-3 py-2 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none" />
                <input data-testid="univ-form-principal-email" type="email" placeholder="Principal email" value={form.principal_email} onChange={(e) => setForm({ ...form, principal_email: e.target.value })}
                  className="px-3 py-2 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none" />
                <input placeholder="Counselor name" value={form.counselor_name} onChange={(e) => setForm({ ...form, counselor_name: e.target.value })}
                  className="px-3 py-2 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none" />
                <input data-testid="univ-form-counselor-email" type="email" placeholder="Counselor email" value={form.counselor_email} onChange={(e) => setForm({ ...form, counselor_email: e.target.value })}
                  className="px-3 py-2 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-brutal bg-white px-5 py-2">Cancel</button>
                <button type="submit" data-testid="univ-form-save" disabled={saving} className="btn-brutal bg-blue-600 text-white px-5 py-2 flex items-center gap-2">
                  {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} strokeWidth={2.5} />} Add School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
