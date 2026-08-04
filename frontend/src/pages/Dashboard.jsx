import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { NEPBadge } from "@/lib/nep";
import { ArrowRight, FileText, Sparkles, RotateCcw } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/results/me").then((r) => setResults(r.data)).finally(() => setLoading(false));
  }, []);

  const hasResults = results.length > 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="label-mono">Dashboard</span>
          <NEPBadge grade={user?.grade} />
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-3">
          Hi, {user?.name}
        </h1>
        <div className="mt-2 text-[#52525B] text-sm flex flex-wrap gap-x-4">
          <span>Class: <b>{user?.grade || "—"}</b></span>
          <span>Board: <b>{user?.education_board || "—"}</b></span>
          <span>School: <b>{user?.school_name || "—"}</b></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-10">
          <div className="md:col-span-7 card-brutal p-8 bg-[#FEF08A]">
            <Sparkles strokeWidth={2.5} size={28} />
            <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight mt-3">
              {hasResults ? "Retake your assessment" : "Take your career assessment"}
            </h2>
            <p className="mt-2 text-sm md:text-base">
              Questions adapt to your class ({user?.grade || "—"}). Pathfinder AI writes a report aligned to NEP 2020 and your board.
            </p>
            <Link to="/assessment" data-testid="start-assessment-btn" className="btn-brutal bg-blue-600 text-white inline-flex items-center gap-2 px-5 py-3 mt-6">
              {hasResults ? <><RotateCcw size={18} strokeWidth={2.5} /> Retake Assessment</> : <>Start Assessment <ArrowRight size={18} strokeWidth={2.5} /></>}
            </Link>
          </div>

          <div className="md:col-span-5 card-brutal p-6 bg-[#A7F3D0]">
            <h3 className="font-display text-xl font-bold">What you'll get (NEP-aligned)</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>• Top 3 careers matched to your traits</li>
              <li>• Stream advice with board-specific tips</li>
              <li>• Multidisciplinary subject recommendations</li>
              <li>• Vocational exposure ideas (NEP 2020 § 4.9)</li>
              <li>• 3-stage roadmap: Now, Next, College+</li>
            </ul>
          </div>
        </div>

        <div className="mt-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="label-mono">Past reports</span>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight mt-1">Your history</h2>
            </div>
          </div>

          {loading ? (
            <div className="label-mono">Loading…</div>
          ) : !hasResults ? (
            <div data-testid="no-results" className="card-brutal p-8 text-center bg-white">
              <FileText size={32} strokeWidth={2.5} className="mx-auto" />
              <p className="mt-3 text-sm text-[#52525B]">No assessments yet. Take your first one above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((r) => (
                <Link key={r.id} to={`/report/${r.id}`} data-testid={`result-card-${r.id}`} className="card-brutal p-6 hover:-translate-y-1 transition-transform">
                  <span className="label-mono">{format(new Date(r.created_at), "dd MMM yyyy")}</span>
                  <h3 className="font-display text-lg font-bold mt-2 line-clamp-2">
                    {r.ai_report?.top_careers?.[0]?.title || "Career Report"}
                  </h3>
                  <p className="text-xs text-[#52525B] mt-2 line-clamp-3">{r.ai_report?.summary}</p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold">
                    View report <ArrowRight size={14} strokeWidth={2.5} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
