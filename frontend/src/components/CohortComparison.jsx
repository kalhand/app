import { useEffect, useState } from "react";
import api from "@/lib/api";
import { BarChart3, Users, GraduationCap, Globe2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

const PALETTE = ["#3B82F6", "#FEF08A", "#A7F3D0", "#E9D5FF", "#FFDDBF"];

function PctBar({ label, value }) {
  if (value == null) return (
    <div className="border-2 border-[#0A0A0A] rounded-xl p-3 bg-white">
      <div className="label-mono">{label}</div>
      <div className="text-xs text-[#52525B] mt-1">Not enough data</div>
    </div>
  );
  return (
    <div className="border-2 border-[#0A0A0A] rounded-xl p-3 bg-white">
      <div className="flex items-baseline justify-between">
        <span className="label-mono">{label}</span>
        <span className="font-display font-extrabold text-lg">{value}<span className="text-xs">th</span></span>
      </div>
      <div className="mt-2 h-2 w-full bg-[#FAFAF9] border border-[#0A0A0A] rounded-full overflow-hidden">
        <div className="h-full bg-blue-600" style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export default function CohortComparison({ resultId }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    api.get(`/cohort/${resultId}`).then((r) => setData(r.data)).catch(() => setErr(true));
  }, [resultId]);

  if (err) return null;
  if (!data) return (
    <div className="card-brutal p-6 label-mono">Loading cohort data…</div>
  );

  const streamSchool = Object.entries(data.stream_distribution_school || {}).map(([name, value]) => ({ name, value }));

  return (
    <section data-testid="cohort-section">
      <span className="label-mono flex items-center gap-2"><BarChart3 size={14} strokeWidth={2.5} /> Cohort comparison</span>
      <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight mt-1 mb-6">How you compare</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { key: "school", label: "In your school", icon: Users, color: "bg-[#FEF08A]" },
          { key: "grade", label: `In Grade ${data.student?.grade || "—"}`, icon: GraduationCap, color: "bg-[#A7F3D0]" },
          { key: "national", label: "Across Pathfinder", icon: Globe2, color: "bg-[#E9D5FF]" },
        ].map((c) => {
          const s = data[c.key] || {};
          return (
            <div key={c.key} data-testid={`cohort-${c.key}`} className={`card-brutal p-5 ${c.color}`}>
              <c.icon strokeWidth={2.5} size={20} />
              <div className="label-mono mt-3">{c.label}</div>
              <div className="text-xs text-[#52525B] mt-1">Sample: {s.size || 0} peers</div>
              <div className="mt-4 space-y-2">
                <PctBar label="Aptitude %ile" value={s.aptitude_pct} />
                <PctBar label="Mental Ability %ile" value={s.mental_pct} />
                <PctBar label="Combined %ile" value={s.combined_pct} />
              </div>
            </div>
          );
        })}
      </div>

      {streamSchool.length > 0 && (
        <div className="card-brutal p-6 mt-6">
          <span className="label-mono">Recommended stream — school mix</span>
          <h3 className="font-display text-lg font-bold mt-1">Where your peers are heading</h3>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={streamSchool}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Bar dataKey="value">
                  {streamSchool.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#0A0A0A" strokeWidth={2} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
