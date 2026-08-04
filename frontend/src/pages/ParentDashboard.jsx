import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import api, { formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { nepStageForGrade } from "@/lib/nep";
import { toast } from "sonner";
import { UserPlus, ArrowRight, Loader2, HeartHandshake } from "lucide-react";
import { format } from "date-fns";

export default function ParentDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [linking, setLinking] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/parent/children");
      setChildren(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const link = async (e) => {
    e.preventDefault();
    setLinking(true);
    try {
      await api.post("/parent/link", { student_email: email });
      toast.success("Child linked");
      setEmail("");
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Could not link");
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <span className="label-mono">Parent Portal · NEP 2020 aware</span>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">
          Hi, {user?.name}
        </h1>
        <p className="text-[#52525B] mt-2 max-w-2xl">
          Track your child's psychometric assessments, understand their NEP stage, and see the AI-generated career report — everything in one place.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-10">
          <form onSubmit={link} className="md:col-span-5 card-brutal p-6 bg-[#A7F3D0]">
            <HeartHandshake strokeWidth={2.5} />
            <h2 className="font-display text-xl font-extrabold mt-3">Link your child</h2>
            <p className="text-sm mt-1">Enter the email your child used to register.</p>
            <div className="mt-4 space-y-3">
              <input
                data-testid="parent-link-email"
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="child@example.com"
                className="w-full px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button data-testid="parent-link-btn" disabled={linking} className="btn-brutal bg-blue-600 text-white w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60">
                {linking ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} strokeWidth={2.5} />} Link Child
              </button>
            </div>
          </form>

          <div className="md:col-span-7 card-brutal p-6 bg-[#FEF08A]">
            <h2 className="font-display text-xl font-extrabold">A note for parents (NEP 2020)</h2>
            <p className="text-sm mt-2 leading-relaxed">
              India's NEP 2020 encourages <b>multidisciplinary learning</b>, <b>choice-based subjects across streams</b>,
              and <b>vocational exposure</b> from Grade 6. Your child's AI report reflects these principles — it doesn't push a single
              stream, it opens options that fit them.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <span className="label-mono">Your children</span>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight mt-1 mb-6">Reports & progress</h2>

          {loading ? (
            <div className="label-mono">Loading…</div>
          ) : children.length === 0 ? (
            <div data-testid="parent-no-children" className="card-brutal p-8 bg-white text-center text-sm text-[#52525B]">
              No children linked yet. Add one using the form above.
            </div>
          ) : (
            <div className="space-y-6">
              {children.map((c) => {
                const nep = c.nep_stage || nepStageForGrade(c.grade);
                const latest = c.results?.[0];
                return (
                  <div key={c.id} data-testid={`parent-child-${c.id}`} className="card-brutal p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-2xl font-extrabold tracking-tight">{c.name}</h3>
                        <div className="mt-2 text-sm text-[#52525B] flex flex-wrap gap-x-4">
                          <span>Class: <b>{c.grade || "—"}</b></span>
                          <span>Board: <b>{c.education_board || "—"}</b></span>
                          <span>School: <b>{c.school_name || "—"}</b></span>
                        </div>
                        <div className="mt-3 inline-flex items-center gap-2 bg-[#E9D5FF] border-2 border-[#0A0A0A] rounded-full px-3 py-1">
                          <span className="label-mono">NEP · {nep.code}</span>
                          <span className="text-xs">{nep.stage}</span>
                        </div>
                      </div>
                      <div className="text-sm text-[#52525B]">Reports: <b>{c.results?.length || 0}</b></div>
                    </div>

                    {latest ? (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 bg-[#FEF08A] border-2 border-[#0A0A0A] rounded-xl p-4">
                          <span className="label-mono">Latest AI summary</span>
                          <p className="text-sm mt-2 leading-relaxed">{c.latest_report?.summary}</p>
                          <p className="text-xs mt-3 text-[#52525B]">Recommended stream: <b>{c.latest_report?.recommended_stream}</b></p>
                        </div>
                        <div className="bg-[#A7F3D0] border-2 border-[#0A0A0A] rounded-xl p-4">
                          <span className="label-mono">Top career fit</span>
                          <div className="font-display font-extrabold text-lg mt-2">
                            {c.latest_report?.top_careers?.[0]?.title || "—"}
                          </div>
                          <div className="text-xs mt-1">Match: {c.latest_report?.top_careers?.[0]?.match_percent}%</div>
                          <Link to={`/report/${latest.id}`} data-testid={`parent-view-report-${c.id}`} className="btn-brutal bg-white inline-flex items-center gap-1 px-3 py-2 text-sm mt-4">
                            View full report <ArrowRight size={14} strokeWidth={2.5} />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 text-sm text-[#52525B]">No assessment submitted yet.</div>
                    )}

                    {c.results?.length > 1 && (
                      <div className="mt-6">
                        <span className="label-mono">All reports</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {c.results.map((r) => (
                            <Link key={r.id} to={`/report/${r.id}`} className="text-xs px-3 py-1.5 bg-white border-2 border-[#0A0A0A] rounded-full hover:bg-[#FEF08A]">
                              {format(new Date(r.created_at), "dd MMM yyyy")}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
