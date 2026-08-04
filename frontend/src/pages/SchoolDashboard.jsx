import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { BarChart3, GraduationCap, Users, Sparkles, ArrowRight, Building2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

const PALETTE = ["#3B82F6", "#FEF08A", "#A7F3D0", "#E9D5FF", "#FFDDBF", "#0A0A0A"];

function BentoStat({ icon: Icon, label, value, color }) {
  return (
    <div className={`card-brutal p-5 ${color}`}>
      <Icon strokeWidth={2.5} size={22} />
      <div className="label-mono mt-3">{label}</div>
      <div className="font-display text-4xl font-extrabold mt-1">{value}</div>
    </div>
  );
}

export default function SchoolDashboard({ variant = "counselor" }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/school/overview").then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const isPrincipal = variant === "principal";
  const title = isPrincipal ? "School Dashboard" : "Counselor Console";
  const subtitle = isPrincipal
    ? "Aggregate view of your school's readiness aligned with NEP 2020."
    : "Support students with data-driven career guidance rooted in NEP 2020.";

  if (loading || !data) {
    return (
      <div className="min-h-screen"><Navbar /><div className="max-w-7xl mx-auto px-4 py-16 label-mono">Loading…</div></div>
    );
  }

  const streamData = Object.entries(data.stream_distribution).map(([k, v]) => ({ name: k, value: v }));
  const boardData = Object.entries(data.board_distribution).map(([k, v]) => ({ name: k, value: v }));

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="label-mono">{isPrincipal ? "Principal" : "Counselor"} · NEP 2020</span>
          <span className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#0A0A0A] rounded-full bg-[#E9D5FF] label-mono">
            <Building2 size={12} strokeWidth={2.5} /> {data.school_name || "Your School"}
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-3">
          {title}
        </h1>
        <p className="text-[#52525B] mt-2 max-w-2xl">{subtitle}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <BentoStat icon={Users} label="Students" value={data.student_count} color="bg-[#A7F3D0]" />
          <BentoStat icon={Sparkles} label="Assessments" value={data.assessment_count} color="bg-[#FEF08A]" />
          <BentoStat icon={BarChart3} label="Strong alignment" value={data.alignment_distribution.strong || 0} color="bg-[#E9D5FF]" />
          <BentoStat icon={GraduationCap} label="Needs reflection" value={data.alignment_distribution.needs_reflection || 0} color="bg-[#FFDDBF]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="card-brutal p-6">
            <span className="label-mono">Stream distribution</span>
            <h3 className="font-display text-lg font-bold mt-1">Recommended stream mix</h3>
            <div className="h-64 mt-4">
              {streamData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={streamData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Bar dataKey="value">
                      {streamData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#0A0A0A" strokeWidth={2} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-sm text-[#52525B]">No data yet</div>}
            </div>
          </div>

          <div className="card-brutal p-6">
            <span className="label-mono">Board distribution</span>
            <h3 className="font-display text-lg font-bold mt-1">Education boards in your school</h3>
            <div className="h-64 mt-4">
              {boardData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={boardData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Bar dataKey="value">
                      {boardData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#0A0A0A" strokeWidth={2} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-sm text-[#52525B]">No data yet</div>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="card-brutal p-6 bg-[#FEF08A]">
            <span className="label-mono">Top careers surfaced</span>
            <ul className="mt-3 space-y-2">
              {data.top_careers.map((c, i) => (
                <li key={i} className="flex items-center justify-between border-b border-[#0A0A0A]/20 py-2">
                  <span className="font-medium">{i + 1}. {c.title}</span>
                  <span className="label-mono">{c.count} students</span>
                </li>
              ))}
              {data.top_careers.length === 0 && <li className="text-sm text-[#52525B]">No data yet.</li>}
            </ul>
          </div>
          <div className="card-brutal p-6 bg-[#A7F3D0]">
            <span className="label-mono">NEP 2020 — Counsellor's action list</span>
            <ul className="mt-3 space-y-2 text-sm">
              <li>• Run career-clarity sessions for students marked <b>needs_reflection</b>.</li>
              <li>• Arrange <b>vocational internships</b> for Grade 9-10 (NEP § 4.9).</li>
              <li>• Facilitate <b>choice-based subject fairs</b> for Grade 11-12.</li>
              <li>• Share reports with parents; hold a joint counselling meet.</li>
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <Link to={isPrincipal ? "/principal/students" : "/counselor/students"} data-testid={`view-students-${variant}`} className="btn-brutal bg-blue-600 text-white inline-flex items-center gap-2 px-5 py-3">
            View all students <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}
