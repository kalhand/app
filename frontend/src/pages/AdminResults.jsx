import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

export default function AdminResults() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/results").then((r) => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <span className="label-mono">Admin</span>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">Student Assessments</h1>
        <p className="text-[#52525B] mt-2">All submitted assessments and AI reports.</p>

        <div className="mt-8 card-brutal overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#FEF08A] border-b-2 border-[#0A0A0A]">
              <tr>
                <th className="text-left px-4 py-3 label-mono">Student</th>
                <th className="text-left px-4 py-3 label-mono">Email</th>
                <th className="text-left px-4 py-3 label-mono">Grade</th>
                <th className="text-left px-4 py-3 label-mono">Top Career</th>
                <th className="text-left px-4 py-3 label-mono">Aptitude</th>
                <th className="text-left px-4 py-3 label-mono">Date</th>
                <th className="text-right px-4 py-3 label-mono">View</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="px-4 py-6 label-mono">Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="7" data-testid="no-admin-results" className="px-4 py-6 text-[#52525B]">No assessments yet.</td></tr>
              ) : (
                items.map((r) => (
                  <tr key={r.id} data-testid={`admin-result-${r.id}`} className="border-b border-[#0A0A0A]/10 hover:bg-[#FAFAF9]">
                    <td className="px-4 py-3 font-semibold">{r.user_name}</td>
                    <td className="px-4 py-3 text-[#52525B]">{r.user_email}</td>
                    <td className="px-4 py-3">{r.grade || "—"}</td>
                    <td className="px-4 py-3">{r.ai_report?.top_careers?.[0]?.title || "—"}</td>
                    <td className="px-4 py-3">{r.scores?.aptitude?.correct}/{r.scores?.aptitude?.total}</td>
                    <td className="px-4 py-3 text-[#52525B]">{format(new Date(r.created_at), "dd MMM yyyy")}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/report/${r.id}`} className="inline-flex items-center gap-1 font-semibold">
                        View <ArrowRight size={14} strokeWidth={2.5} />
                      </Link>
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
