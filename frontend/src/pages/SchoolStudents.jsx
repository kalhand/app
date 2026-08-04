import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { nepStageForGrade } from "@/lib/nep";
import { ArrowRight, Search } from "lucide-react";
import { format } from "date-fns";

export default function SchoolStudents({ variant = "counselor" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");

  useEffect(() => {
    api.get("/school/students").then((r) => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  const grades = useMemo(() => {
    const s = new Set(items.map((x) => x.grade).filter(Boolean));
    return ["all", ...Array.from(s).sort()];
  }, [items]);

  const filtered = items.filter((s) => {
    const hay = `${s.name} ${s.email} ${s.grade || ""} ${s.education_board || ""}`.toLowerCase();
    const okQ = !q || hay.includes(q.toLowerCase());
    const okG = gradeFilter === "all" || String(s.grade) === String(gradeFilter);
    return okQ && okG;
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <span className="label-mono">{variant === "principal" ? "Principal" : "Counselor"} · Students</span>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">All students</h1>
        <p className="text-[#52525B] mt-2">School-scoped view with the latest AI recommendation per student.</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" strokeWidth={2.5} />
            <input
              data-testid="school-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email…"
              className="pl-10 pr-4 py-2 border-2 border-[#0A0A0A] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {grades.map((g) => (
              <button key={g} onClick={() => setGradeFilter(g)}
                className={`px-3 py-1.5 border-2 border-[#0A0A0A] rounded-full text-sm font-semibold ${gradeFilter === g ? "bg-[#0A0A0A] text-white" : "bg-white"}`}>
                {g === "all" ? "All grades" : `Grade ${g}`}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 card-brutal overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#FEF08A] border-b-2 border-[#0A0A0A]">
              <tr>
                <th className="text-left px-4 py-3 label-mono">Student</th>
                <th className="text-left px-4 py-3 label-mono">Class · Board</th>
                <th className="text-left px-4 py-3 label-mono">NEP Stage</th>
                <th className="text-left px-4 py-3 label-mono">Latest Career</th>
                <th className="text-left px-4 py-3 label-mono">Recommended Stream</th>
                <th className="text-left px-4 py-3 label-mono">Last Assessed</th>
                <th className="text-right px-4 py-3 label-mono">View</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="px-4 py-6 label-mono">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" data-testid="school-no-students" className="px-4 py-6 text-[#52525B]">No matching students.</td></tr>
              ) : (
                filtered.map((s) => {
                  const nep = s.nep_stage || nepStageForGrade(s.grade);
                  const lr = s.latest_result;
                  return (
                    <tr key={s.id} data-testid={`school-student-${s.id}`} className="border-b border-[#0A0A0A]/10 hover:bg-[#FAFAF9]">
                      <td className="px-4 py-3">
                        <div className="font-semibold">{s.name}</div>
                        <div className="text-xs text-[#52525B]">{s.email}</div>
                      </td>
                      <td className="px-4 py-3">{s.grade || "—"} · {s.education_board || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 bg-[#E9D5FF] border-2 border-[#0A0A0A] rounded-full">{nep.code}</span>
                        <span className="ml-2 text-xs">{nep.stage}</span>
                      </td>
                      <td className="px-4 py-3">{lr?.ai_report?.top_careers?.[0]?.title || <span className="text-[#52525B]">—</span>}</td>
                      <td className="px-4 py-3">{lr?.ai_report?.recommended_stream?.split("—")[0]?.trim() || <span className="text-[#52525B]">—</span>}</td>
                      <td className="px-4 py-3 text-[#52525B]">{lr ? format(new Date(lr.created_at), "dd MMM yyyy") : "—"}</td>
                      <td className="px-4 py-3 text-right">
                        {lr ? (
                          <Link to={`/report/${lr.id}`} className="inline-flex items-center gap-1 font-semibold">
                            Report <ArrowRight size={14} strokeWidth={2.5} />
                          </Link>
                        ) : <span className="text-xs text-[#52525B]">No report</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
