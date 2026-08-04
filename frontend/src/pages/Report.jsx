import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { Sparkles, Award, TrendingUp, Compass, GraduationCap, Route, Loader2 } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

const AI_IMG =
  "https://images.unsplash.com/photo-1617791160536-598cf32026fb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMGdsb3dpbmclMjBicmFpbiUyMEFJfGVufDB8fHx8MTc4NTMxMjkyMXww&ixlib=rb-4.1.0&q=85";

const ALIGNMENT_STYLE = {
  strong: { color: "bg-[#A7F3D0]", label: "Strong alignment" },
  moderate: { color: "bg-[#FEF08A]", label: "Moderate alignment" },
  needs_reflection: { color: "bg-[#FFDDBF]", label: "Needs reflection" },
};

export default function Report() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/results/${id}`).then((r) => setData(r.data));
  }, [id]);

  if (!data) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 flex items-center gap-3">
          <Loader2 className="animate-spin" /> <span className="label-mono">Loading report…</span>
        </div>
      </div>
    );
  }

  const r = data.ai_report || {};
  const align = ALIGNMENT_STYLE[r.path_alignment] || ALIGNMENT_STYLE.moderate;

  const traitData = Object.entries(data.scores?.trait_scores || {}).map(([trait, value]) => ({ trait, value }));

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          <div className="md:col-span-8 card-brutal p-8">
            <span className="label-mono flex items-center gap-2"><Sparkles size={14} strokeWidth={2.5} /> AI Career Report</span>
            <h1 data-testid="report-title" className="font-display text-3xl md:text-5xl font-extrabold tracking-tighter mt-3">
              Hey {data.user_name}, here's your path.
            </h1>
            <p className="mt-4 text-base md:text-lg leading-relaxed text-[#0A0A0A]">{r.summary}</p>
            <div className={`mt-6 inline-flex items-center gap-2 px-3 py-1 border-2 border-[#0A0A0A] rounded-full ${align.color}`}>
              <span className="label-mono">{align.label}</span>
            </div>
          </div>
          <div className="md:col-span-4 card-brutal p-4 bg-[#E9D5FF]">
            <img src={AI_IMG} alt="AI Brain" className="w-full h-56 object-cover rounded-xl border-2 border-[#0A0A0A]" />
            <p className="mt-3 text-sm font-medium">Analyzed by Claude Sonnet 4.5</p>
          </div>
        </div>

        {/* Top Careers */}
        <section className="mb-10">
          <span className="label-mono">Top matches</span>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight mt-1 mb-6">Careers that fit you</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(r.top_careers || []).map((c, i) => (
              <div key={i} data-testid={`career-card-${i}`} className="card-brutal p-6">
                <div className="flex items-start justify-between">
                  <Award strokeWidth={2.5} size={26} />
                  <span className="label-mono bg-[#A7F3D0] px-2 py-1 border-2 border-[#0A0A0A] rounded-full">{c.match_percent}%</span>
                </div>
                <h3 className="font-display text-xl font-bold mt-3">{c.title}</h3>
                <p className="text-sm mt-2 text-[#52525B] leading-relaxed">{c.why}</p>
                {c.typical_subjects?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {c.typical_subjects.map((s, k) => (
                      <span key={k} className="text-xs px-2 py-1 bg-[#FEF08A] border-2 border-[#0A0A0A] rounded-full">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Personality + Chart */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
          <div className="md:col-span-7 card-brutal p-8">
            <span className="label-mono flex items-center gap-2"><Compass size={14} strokeWidth={2.5} /> Personality</span>
            <h2 className="font-display text-2xl font-extrabold tracking-tight mt-2">Who you are</h2>
            <p className="mt-4 text-sm md:text-base leading-relaxed">{r.personality_analysis}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-[#A7F3D0] border-2 border-[#0A0A0A] rounded-xl p-4">
                <div className="label-mono flex items-center gap-1"><TrendingUp size={12} strokeWidth={2.5} /> Strengths</div>
                <ul className="mt-2 space-y-1 text-sm">
                  {(r.strengths || []).map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#FFDDBF] border-2 border-[#0A0A0A] rounded-xl p-4">
                <div className="label-mono">Growth areas</div>
                <ul className="mt-2 space-y-1 text-sm">
                  {(r.growth_areas || []).map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 card-brutal p-6">
            <span className="label-mono">Your trait signature</span>
            <div className="h-72 mt-4">
              {traitData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={traitData}>
                    <PolarGrid stroke="#0A0A0A" />
                    <PolarAngleAxis dataKey="trait" tick={{ fontSize: 11, fill: "#0A0A0A" }} />
                    <PolarRadiusAxis tick={false} />
                    <Radar dataKey="value" stroke="#2563EB" fill="#3B82F6" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-[#52525B]">No trait data</div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="bg-white border-2 border-[#0A0A0A] rounded-lg p-2">
                <div className="label-mono">Aptitude</div>
                <div className="font-display font-extrabold">{data.scores?.aptitude?.correct}/{data.scores?.aptitude?.total}</div>
              </div>
              <div className="bg-white border-2 border-[#0A0A0A] rounded-lg p-2">
                <div className="label-mono">Mental Ability</div>
                <div className="font-display font-extrabold">{data.scores?.mental_ability?.correct}/{data.scores?.mental_ability?.total}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Stream + NEP + Board */}
        <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 card-brutal p-8 bg-[#FEF08A]">
            <span className="label-mono flex items-center gap-2"><GraduationCap size={14} strokeWidth={2.5} /> Recommended stream</span>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight mt-3">{r.recommended_stream}</h2>
            {r.nep_alignment && (
              <div className="mt-5 bg-white border-2 border-[#0A0A0A] rounded-xl p-4">
                <span className="label-mono">NEP 2020 alignment</span>
                <p className="text-sm mt-2 leading-relaxed">{r.nep_alignment}</p>
              </div>
            )}
          </div>
          <div className="card-brutal p-6 bg-[#A7F3D0]">
            <span className="label-mono">Board note · {data.education_board || "N/A"}</span>
            <p className="text-sm mt-3 leading-relaxed">{r.board_notes || "Follow your board's flexible skill electives."}</p>
            {data.nep_stage && (
              <div className="mt-4 text-xs">
                <div className="font-bold">NEP Stage</div>
                <div>{data.nep_stage.stage}</div>
                <div className="text-[#52525B] mt-1">{data.nep_stage.focus}</div>
              </div>
            )}
          </div>
        </section>

        {/* Roadmap */}
        <section className="mb-14">
          <span className="label-mono flex items-center gap-2"><Route size={14} strokeWidth={2.5} /> Your roadmap</span>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight mt-1 mb-6">What to do next</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(r.roadmap || []).map((s, i) => (
              <div key={i} className="card-brutal p-6">
                <span className="font-display text-4xl font-extrabold text-blue-600">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-lg font-bold mt-2">{s.stage}</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {(s.actions || []).map((a, k) => (
                    <li key={k}>• {a}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {r.encouragement && (
          <div className="card-brutal p-6 bg-[#A7F3D0] text-center">
            <p className="font-display text-lg font-bold">{r.encouragement}</p>
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link to="/dashboard" data-testid="back-dashboard" className="btn-brutal bg-white px-6 py-3">Back to dashboard</Link>
        </div>
      </div>
    </div>
  );
}
