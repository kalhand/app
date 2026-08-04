import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { Search, Filter, ArrowRight } from "lucide-react";

export default function UniversityStudents() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [field, setField] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (field) params.set("field", field);
    if (schoolFilter !== "all") params.set("school", schoolFilter);
    if (gradeFilter !== "all") params.set("grade", gradeFilter);
    api.get(`/university/students?${params.toString()}`).then((r) => setItems(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const schools = useMemo(() => ["all", ...Array.from(new Set(items.map((s) => s.school_name).filter(Boolean))).sort()], [items]);
  const grades = useMemo(() => ["all", ...Array.from(new Set(items.map((s) => s.grade).filter(Boolean))).sort()], [items]);

  const filtered = items.filter((s) => {
    if (!q) return true;
    const hay = `${s.name} ${s.email} ${s.top_career || ""} ${s.recommended_stream || ""} ${s.school_name || ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <span className="label-mono">University · Students</span>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">Filter students by field</h1>
        <p className="text-[#52525B] mt-2">Search by career, stream, or school across every registered institution.</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" strokeWidth={2.5} />
            <input
              data-testid="univ-students-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, career…"
              className="pl-10 pr-4 py-2 border-2 border-[#0A0A0A] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[240px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} strokeWidth={2.5} />
            <input
              data-testid="univ-field-filter"
              value={field}
              onChange={(e) => setField(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") load(); }}
              placeholder="Career/stream contains (e.g. Engineer)"
              className="px-3 py-2 border-2 border-[#0A0A0A] rounded-full bg-white text-sm focus:outline-none min-w-[240px]"
            />
            <button onClick={load} data-testid="univ-apply-filter" className="btn-brutal bg-white px-3 py-2 text-sm">Apply</button>
          </div>
          <select value={schoolFilter} onChange={(e) => { setSchoolFilter(e.target.value); }} className="px-3 py-2 border-2 border-[#0A0A0A] rounded-full text-sm bg-white">
            {schools.map((s) => <option key={s} value={s}>{s === "all" ? "All schools" : s}</option>)}
          </select>
          <select value={gradeFilter} onChange={(e) => { setGradeFilter(e.target.value); }} className="px-3 py-2 border-2 border-[#0A0A0A] rounded-full text-sm bg-white">
            {grades.map((g) => <option key={g} value={g}>{g === "all" ? "All grades" : `Grade ${g}`}</option>)}
          </select>
          <button onClick={load} className="btn-brutal bg-blue-600 text-white px-3 py-2 text-sm">Refresh</button>
        </div>

        <div className="mt-6 label-mono">Results: {filtered.length}</div>

        <div className="mt-4 card-brutal overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FEF08A] border-b-2 border-[#0A0A0A]">
              <tr>
                <th className="text-left px-4 py-3 label-mono">Student</th>
                <th className="text-left px-4 py-3 label-mono">School</th>
                <th className="text-left px-4 py-3 label-mono">Class · Board</th>
                <th className="text-left px-4 py-3 label-mono">Top Career</th>
                <th className="text-left px-4 py-3 label-mono">Stream</th>
                <th className="text-right px-4 py-3 label-mono">Report</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="px-4 py-6 label-mono">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" data-testid="univ-students-empty" className="px-4 py-6 text-[#52525B]">No students match.</td></tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} data-testid={`univ-student-${s.id}`} className="border-b border-[#0A0A0A]/10 hover:bg-[#FAFAF9]">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-xs text-[#52525B]">{s.email}</div>
                    </td>
                    <td className="px-4 py-3">{s.school_name || "—"}</td>
                    <td className="px-4 py-3">{s.grade || "—"} · {s.education_board || "—"}</td>
                    <td className="px-4 py-3">{s.top_career || <span className="text-[#52525B]">—</span>}</td>
                    <td className="px-4 py-3">{s.recommended_stream || <span className="text-[#52525B]">—</span>}</td>
                    <td className="px-4 py-3 text-right">
                      {s.latest_result_id ? (
                        <Link to={`/report/${s.latest_result_id}`} className="inline-flex items-center gap-1 font-semibold">
                          Open <ArrowRight size={14} strokeWidth={2.5} />
                        </Link>
                      ) : <span className="text-xs text-[#52525B]">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
