import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { Loader2, Briefcase, GraduationCap, DollarSign, TrendingUp, LightbulbIcon, ArrowRight, BookOpen, Building, MapPin } from "lucide-react";

export default function CareerExplorer() {
  const { title } = useParams();
  const [search] = useSearchParams();
  const { user } = useAuth();
  const { lang, t } = useLang();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const stream = search.get("stream");

  useEffect(() => {
    setLoading(true);
    api.post("/careers/explore", {
      title: decodeURIComponent(title),
      grade: user?.grade,
      education_board: user?.education_board,
      language: lang,
    })
      .then((r) => setData(r.data))
      .catch(() => setErr("Could not load career deep-dive. Please try again."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, lang, user?.id, user?.grade, user?.education_board]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 flex items-center gap-3">
          <Loader2 className="animate-spin" /> <span className="label-mono">Generating deep-dive…</span>
        </div>
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-sm text-red-700">{err || "No data"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <span className="label-mono flex items-center gap-2"><Briefcase size={14} strokeWidth={2.5} /> Career deep-dive</span>
        <h1 data-testid="career-title" className="font-display text-4xl md:text-6xl font-extrabold tracking-tighter mt-3">
          {data.title}
        </h1>
        <p className="text-lg mt-4 max-w-3xl">{data.one_liner}</p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-10">
          {/* Day in the life */}
          <div className="md:col-span-7 card-brutal p-6 bg-[#FEF08A]">
            <span className="label-mono">A day in the life</span>
            <p className="mt-3 leading-relaxed text-sm md:text-base">{data.day_in_the_life}</p>
          </div>

          {/* Salary bands */}
          <div className="md:col-span-5 card-brutal p-6 bg-[#A7F3D0]">
            <span className="label-mono flex items-center gap-2"><DollarSign size={14} strokeWidth={2.5} /> Salary in India (INR)</span>
            <div className="mt-4 space-y-3">
              {[
                { key: "entry_level", label: "Entry" },
                { key: "mid_career", label: "Mid" },
                { key: "senior", label: "Senior" },
              ].map((b) => (
                <div key={b.key} className="flex items-center justify-between border-b border-[#0A0A0A]/20 pb-2">
                  <span className="text-sm font-semibold">{b.label}</span>
                  <span className="font-display font-extrabold">{data.salary_bands_inr?.[b.key] || "—"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Core skills & subjects */}
          <div className="md:col-span-6 card-brutal p-6">
            <span className="label-mono flex items-center gap-2"><TrendingUp size={14} strokeWidth={2.5} /> Core skills</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {(data.core_skills || []).map((s, i) => (
                <span key={i} className="text-xs px-3 py-1.5 bg-[#E9D5FF] border-2 border-[#0A0A0A] rounded-full">{s}</span>
              ))}
            </div>
            <div className="mt-6">
              <span className="label-mono flex items-center gap-2"><BookOpen size={14} strokeWidth={2.5} /> Key subjects</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {(data.key_subjects || []).map((s, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 bg-[#FEF08A] border-2 border-[#0A0A0A] rounded-full">{s}</span>
                ))}
              </div>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 border-2 border-[#0A0A0A] rounded-full bg-[#FFDDBF] px-3 py-1">
              <GraduationCap size={12} strokeWidth={2.5} />
              <span className="label-mono">Best stream: {data.recommended_stream}</span>
            </div>
          </div>

          {/* Growth outlook */}
          <div className="md:col-span-6 card-brutal p-6 bg-[#E9D5FF]">
            <span className="label-mono flex items-center gap-2"><TrendingUp size={14} strokeWidth={2.5} /> 5-10 year outlook in India</span>
            <p className="mt-3 leading-relaxed">{data.growth_outlook}</p>
            {data.adjacent_careers?.length > 0 && (
              <div className="mt-5">
                <span className="label-mono">Adjacent careers</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.adjacent_careers.map((c, i) => (
                    <Link key={i} to={`/career/${encodeURIComponent(c)}`} data-testid={`adjacent-career-${i}`} className="text-xs px-3 py-1.5 bg-white border-2 border-[#0A0A0A] rounded-full hover:bg-[#FEF08A]">
                      {c} →
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Path in India */}
        <section className="mt-10">
          <span className="label-mono flex items-center gap-2"><MapPin size={14} strokeWidth={2.5} /> Your path in India</span>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight mt-1 mb-6">College & entry routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(data.india_college_paths || []).map((s, i) => (
              <div key={i} className="card-brutal p-6">
                <span className="font-display text-4xl font-extrabold text-blue-600">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-lg font-bold mt-2">{s.stage}</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {(s.options || []).map((o, k) => <li key={k}>• {o}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Top institutes */}
        {data.top_indian_institutes?.length > 0 && (
          <section className="mt-10 card-brutal p-6 bg-[#FEF08A]">
            <span className="label-mono flex items-center gap-2"><Building size={14} strokeWidth={2.5} /> Top Indian institutes</span>
            <ol className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm list-decimal ml-4">
              {data.top_indian_institutes.map((n, i) => <li key={i}>{n}</li>)}
            </ol>
          </section>
        )}

        {/* Myths vs facts */}
        {data.myths_vs_facts?.length > 0 && (
          <section className="mt-10">
            <span className="label-mono flex items-center gap-2"><LightbulbIcon size={14} strokeWidth={2.5} /> Myths vs facts</span>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight mt-1 mb-6">Bust the doubts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.myths_vs_facts.map((m, i) => (
                <div key={i} className="card-brutal p-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-red-700">Myth</div>
                  <p className="mt-1 text-sm">{m.myth}</p>
                  <div className="mt-3 text-xs font-bold uppercase tracking-wider text-green-800">Fact</div>
                  <p className="mt-1 text-sm">{m.fact}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.resources?.length > 0 && (
          <section className="mt-10 card-brutal p-6 bg-[#A7F3D0]">
            <span className="label-mono">Learning resources</span>
            <ul className="mt-3 space-y-2 text-sm">
              {data.resources.map((r, i) => (
                <li key={i}><b>{r.label}</b> — {r.note}</li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10 print:hidden">
          <Link to="/dashboard" data-testid="career-back-btn" className="btn-brutal bg-white inline-flex items-center gap-2 px-5 py-3">
            <ArrowRight size={16} strokeWidth={2.5} className="rotate-180" /> Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
