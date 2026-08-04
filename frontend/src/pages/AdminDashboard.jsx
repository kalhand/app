import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { Users, ListChecks, FileText, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, questions: 0, assessments: 0 });

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data));
  }, []);

  const cards = [
    { k: "users", label: "Students", icon: Users, color: "bg-[#A7F3D0]", to: "/admin/results" },
    { k: "questions", label: "Questions", icon: ListChecks, color: "bg-[#FEF08A]", to: "/admin/questions" },
    { k: "assessments", label: "Assessments", icon: FileText, color: "bg-[#E9D5FF]", to: "/admin/results" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <span className="label-mono">Admin</span>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">Control Center</h1>
        <p className="text-[#52525B] mt-2">Manage the question bank and review student assessments.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {cards.map((c) => (
            <Link key={c.k} to={c.to} data-testid={`admin-stat-${c.k}`} className={`card-brutal p-8 ${c.color} hover:-translate-y-1 transition-transform`}>
              <c.icon strokeWidth={2.5} size={28} />
              <div className="label-mono mt-4">{c.label}</div>
              <div className="font-display text-5xl font-extrabold tracking-tight mt-2">{stats[c.k]}</div>
              <div className="mt-4 text-sm font-semibold flex items-center gap-1">Manage <ArrowRight size={14} strokeWidth={2.5} /></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
