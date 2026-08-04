import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { Printer, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

const PAL = ["#3B82F6", "#FEF08A", "#A7F3D0", "#E9D5FF", "#FFDDBF"];

export default function ClassReport() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grade, setGrade] = useState("");

  const load = (g) => {
    setLoading(true);
    api.get(`/school/class-report${g ? `?grade=${g}` : ""}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(""); }, []);

  if (loading || !data) return (
    <div className="min-h-screen"><Navbar /><div className="max-w-5xl mx-auto px-4 py-16 label-mono">Loading class report…</div></div>
  );

  const streamData = Object.entries(data.stream_distribution).map(([name, value]) => ({ name, value }));
  const traitData = Object.entries(data.trait_totals).map(([name, value]) => ({ name, value })).slice(0, 8);
  const alignPct = (k) => {
    const total = Object.values(data.alignment_distribution).reduce((a, b) => a + b, 0);
    if (!total) return 0;
    return Math.round(((data.alignment_distribution[k] || 0) / total) * 100);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div>
            <span className="label-mono">{user?.role === "principal" ? "Principal" : "Counselor"} · Class report</span>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">
              Class Comparison Report
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter size={14} strokeWidth={2.5} />
              <input
                data-testid="class-report-grade"
                placeholder="Filter by class (e.g. 10)"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") load(grade); }}
                className="px-3 py-2 border-2 border-[#0A0A0A] rounded-full text-sm bg-white focus:outline-none"
              />
              <button data-testid="class-report-apply" onClick={() => load(grade)} className="btn-brutal bg-white px-3 py-2 text-sm">Apply</button>
            </div>
            <button data-testid="class-report-print" onClick={() => window.print()} className="btn-brutal bg-[#0A0A0A] text-white px-4 py-2 text-sm flex items-center gap-2">
              <Printer size={16} strokeWidth={2.5} /> Print / PDF
            </button>
          </div>
        </div>

        {/* Print header */}
        <div className="mt-6 md:mt-8">
          <div className="card-brutal p-6 bg-[#FEF08A]">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <div className="label-mono">School</div>
                <div className="font-display text-2xl font-extrabold">{data.school_name || "—"}</div>
              </div>
              <div>
                <div className="label-mono">Class</div>
                <div className="font-display text-2xl font-extrabold">{data.grade || "All classes"}</div>
              </div>
              <div>
                <div className="label-mono">Students</div>
                <div className="font-display text-2xl font-extrabold">{data.student_count}</div>
              </div>
              <div>
                <div className="label-mono">Assessments</div>
                <div className="font-display text-2xl font-extrabold">{data.assessment_count}</div>
              </div>
              <div>
                <div className="label-mono">Generated</div>
                <div className="text-sm">{format(new Date(data.generated_at), "dd MMM yyyy, HH:mm")}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="card-brutal p-6">
            <span className="label-mono">Aptitude — class average</span>
            <div className="font-display text-4xl font-extrabold mt-2">{Math.round(data.avg_aptitude * 100)}%</div>
            <div className="mt-3 h-3 border-2 border-[#0A0A0A] rounded-full overflow-hidden bg-white">
              <div className="h-full bg-blue-600" style={{ width: `${Math.round(data.avg_aptitude * 100)}%` }} />
            </div>
          </div>
          <div className="card-brutal p-6">
            <span className="label-mono">Mental Ability — class average</span>
            <div className="font-display text-4xl font-extrabold mt-2">{Math.round(data.avg_mental * 100)}%</div>
            <div className="mt-3 h-3 border-2 border-[#0A0A0A] rounded-full overflow-hidden bg-white">
              <div className="h-full bg-[#FEF08A]" style={{ width: `${Math.round(data.avg_mental * 100)}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="card-brutal p-6">
            <span className="label-mono">Recommended stream distribution</span>
            <div className="h-64 mt-4">
              {streamData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={streamData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Bar dataKey="value">
                      {streamData.map((_, i) => <Cell key={i} fill={PAL[i % PAL.length]} stroke="#0A0A0A" strokeWidth={2} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-sm text-[#52525B]">No data</div>}
            </div>
          </div>
          <div className="card-brutal p-6">
            <span className="label-mono">Dominant traits (aggregate)</span>
            <div className="h-64 mt-4">
              {traitData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={traitData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Bar dataKey="value">
                      {traitData.map((_, i) => <Cell key={i} fill={PAL[i % PAL.length]} stroke="#0A0A0A" strokeWidth={2} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-sm text-[#52525B]">No data</div>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {[
            { k: "strong", label: "Strong alignment", color: "bg-[#A7F3D0]" },
            { k: "moderate", label: "Moderate", color: "bg-[#FEF08A]" },
            { k: "needs_reflection", label: "Needs reflection", color: "bg-[#FFDDBF]" },
          ].map((a) => (
            <div key={a.k} className={`card-brutal p-6 ${a.color}`}>
              <span className="label-mono">{a.label}</span>
              <div className="mt-2 font-display text-4xl font-extrabold">{data.alignment_distribution[a.k] || 0}</div>
              <div className="text-xs text-[#52525B] mt-1">{alignPct(a.k)}% of assessed</div>
            </div>
          ))}
        </div>

        <div className="mt-6 card-brutal p-6">
          <span className="label-mono">Top career fits across class</span>
          <ul className="mt-4 divide-y divide-[#0A0A0A]/20">
            {data.top_careers.length > 0 ? data.top_careers.map((c, i) => (
              <li key={i} className="py-2 flex items-center justify-between">
                <span className="font-medium">{i + 1}. {c.title}</span>
                <span className="label-mono">{c.count} students</span>
              </li>
            )) : <li className="text-sm text-[#52525B]">No data</li>}
          </ul>
        </div>

        {data.students_needing_attention.length > 0 && (
          <div className="mt-6 card-brutal p-6 bg-[#FFDDBF]">
            <span className="label-mono">Students who may need counselling</span>
            <table className="w-full text-sm mt-4">
              <thead className="border-b-2 border-[#0A0A0A]">
                <tr><th className="text-left py-2">Name</th><th className="text-left py-2">Email</th><th className="text-left py-2">Class</th></tr>
              </thead>
              <tbody>
                {data.students_needing_attention.map((s, i) => (
                  <tr key={i} data-testid={`class-report-attn-${i}`} className="border-b border-[#0A0A0A]/10">
                    <td className="py-2 font-medium">{s.name}</td>
                    <td className="py-2 text-[#52525B]">{s.email}</td>
                    <td className="py-2">{s.grade || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 text-xs text-[#52525B] text-center">
          © Pathfinder AI · Aligned with NEP 2020 · Generated {format(new Date(data.generated_at), "dd MMM yyyy")}
        </div>
      </div>
    </div>
  );
}
