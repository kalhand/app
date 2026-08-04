import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Building2, Users, Sparkles, GraduationCap, BarChart3, ArrowRight, Globe2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

const PAL = ["#3B82F6", "#FEF08A", "#A7F3D0", "#E9D5FF", "#FFDDBF"];

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className={`card-brutal p-5 ${color}`}>
      <Icon strokeWidth={2.5} size={22} />
      <div className="label-mono mt-3">{label}</div>
      <div className="font-display text-4xl font-extrabold mt-1">{value}</div>
    </div>
  );
}

export default function UniversityDashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    api.get("/university/overview").then((r) => setOverview(r.data));
  }, []);

  if (!overview) return <div className="min-h-screen"><Navbar /><div className="max-w-7xl mx-auto px-4 py-16 label-mono">Loading…</div></div>;

  const streamData = Object.entries(overview.stream_distribution).map(([name, value]) => ({ name, value }));
  const boardData = Object.entries(overview.board_distribution).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="label-mono flex items-center gap-2"><Globe2 size={14} strokeWidth={2.5} /> University Control · NEP 2020</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-3">
          {user?.organization_name || user?.name}
        </h1>
        <p className="text-[#52525B] mt-2 max-w-2xl">Onboard schools, grant access, and see cross-school career analytics.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Stat icon={Building2} label="Schools" value={overview.school_count} color="bg-[#FEF08A]" />
          <Stat icon={Users} label="Students" value={overview.student_count} color="bg-[#A7F3D0]" />
          <Stat icon={Sparkles} label="Assessments" value={overview.assessment_count} color="bg-[#E9D5FF]" />
          <Stat icon={GraduationCap} label="Strong alignment" value={overview.alignment_distribution?.strong || 0} color="bg-[#FFDDBF]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="card-brutal p-6">
            <span className="label-mono">Global stream distribution</span>
            <div className="h-64 mt-4">
              {streamData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={streamData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Bar dataKey="value">{streamData.map((_, i) => <Cell key={i} fill={PAL[i % PAL.length]} stroke="#0A0A0A" strokeWidth={2} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-sm text-[#52525B]">No data</div>}
            </div>
          </div>
          <div className="card-brutal p-6">
            <span className="label-mono">Boards represented</span>
            <div className="h-64 mt-4">
              {boardData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={boardData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Bar dataKey="value">{boardData.map((_, i) => <Cell key={i} fill={PAL[i % PAL.length]} stroke="#0A0A0A" strokeWidth={2} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-sm text-[#52525B]">No data</div>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2 card-brutal p-6 bg-[#FEF08A]">
            <span className="label-mono flex items-center gap-2"><BarChart3 size={14} strokeWidth={2.5} /> Top careers surfaced globally</span>
            <ol className="mt-4 divide-y divide-[#0A0A0A]/20">
              {overview.top_careers.length > 0 ? overview.top_careers.map((c, i) => (
                <li key={i} data-testid={`univ-career-${i}`} className="py-2 flex items-center justify-between">
                  <span className="font-medium">{i + 1}. {c.title}</span>
                  <span className="label-mono">{c.count} students</span>
                </li>
              )) : <li className="text-sm text-[#52525B]">No data</li>}
            </ol>
          </div>
          <div className="card-brutal p-6 bg-[#A7F3D0]">
            <span className="label-mono">Quick actions</span>
            <div className="mt-4 space-y-3">
              <Link to="/university/schools" data-testid="univ-manage-schools" className="btn-brutal bg-white block px-4 py-3 flex items-center justify-between">
                Manage schools <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
              <Link to="/university/students" data-testid="univ-manage-students" className="btn-brutal bg-white block px-4 py-3 flex items-center justify-between">
                Filter students by field <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
