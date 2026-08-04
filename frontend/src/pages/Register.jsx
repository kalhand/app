import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";
import { BOARDS } from "@/lib/nep";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Loader2, GraduationCap, Users, HeartHandshake, Building2 } from "lucide-react";

const ROLES = [
  { value: "student", label: "Student", icon: GraduationCap, color: "bg-[#FEF08A]", desc: "Take the assessment & get AI career guidance" },
  { value: "parent", label: "Parent / Guardian", icon: HeartHandshake, color: "bg-[#A7F3D0]", desc: "Track your child's assessment & report" },
  { value: "counselor", label: "School Counselor", icon: Users, color: "bg-[#E9D5FF]", desc: "See all students in your school" },
  { value: "principal", label: "School Principal", icon: Building2, color: "bg-[#FFDDBF]", desc: "School-wide analytics dashboard" },
];

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    name: "", email: "", password: "", grade: "",
    education_board: "", school_name: "", linked_student_email: "",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role };
      if (role === "student") {
        payload.grade = form.grade || undefined;
        payload.education_board = form.education_board || undefined;
        payload.school_name = form.school_name || undefined;
      } else if (role === "parent") {
        if (form.linked_student_email) payload.linked_student_emails = [form.linked_student_email];
      } else {
        payload.school_name = form.school_name || undefined;
      }
      const user = await register(payload);
      toast.success(`Welcome, ${user.name}!`);
      const dest = role === "student" ? "/dashboard"
        : role === "parent" ? "/parent"
        : role === "counselor" ? "/counselor"
        : "/principal";
      nav(dest);
    } catch (e) {
      setErr(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="card-brutal p-8">
          <span className="label-mono">Get started</span>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tighter mt-2">Create your account</h1>
          <p className="text-sm text-[#52525B] mt-2">Aligned with India's NEP 2020 — pick your role to continue.</p>

          {/* Role picker */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                data-testid={`role-${r.value}`}
                onClick={() => setRole(r.value)}
                className={`text-left border-2 border-[#0A0A0A] rounded-xl p-3 transition-transform ${role === r.value ? `${r.color} translate-y-[-2px] shadow-[3px_3px_0_0_rgba(10,10,10,1)]` : "bg-white"}`}
              >
                <r.icon strokeWidth={2.5} size={20} />
                <div className="mt-2 font-display font-bold text-sm">{r.label}</div>
                <div className="text-[11px] text-[#52525B] leading-snug mt-1">{r.desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-mono block mb-2">Full name</label>
                <input data-testid="register-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="label-mono block mb-2">Email</label>
                <input data-testid="register-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="label-mono block mb-2">Password</label>
              <input data-testid="register-password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {role === "student" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label-mono block mb-2">Class / Grade</label>
                  <input data-testid="register-grade" placeholder="e.g. 10" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="w-full px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="label-mono block mb-2">Education Board</label>
                  <select data-testid="register-board" value={form.education_board} onChange={(e) => setForm({ ...form, education_board: e.target.value })} className="w-full px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select board</option>
                    {BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-mono block mb-2">School</label>
                  <input data-testid="register-school" value={form.school_name} onChange={(e) => setForm({ ...form, school_name: e.target.value })} className="w-full px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            )}

            {(role === "counselor" || role === "principal") && (
              <div>
                <label className="label-mono block mb-2">School name</label>
                <input data-testid="register-school-officer" required value={form.school_name} onChange={(e) => setForm({ ...form, school_name: e.target.value })} className="w-full px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-[#52525B] mt-1">You will see all students registered with this exact school name.</p>
              </div>
            )}

            {role === "parent" && (
              <div>
                <label className="label-mono block mb-2">Your child's email (optional — you can link later)</label>
                <input data-testid="register-child-email" type="email" value={form.linked_student_email} onChange={(e) => setForm({ ...form, linked_student_email: e.target.value })} className="w-full px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}

            {err && <div data-testid="register-error" className="text-sm text-red-700 bg-red-100 border-2 border-red-700 rounded-lg px-3 py-2">{err}</div>}

            <button type="submit" data-testid="register-submit" disabled={loading} className="btn-brutal bg-blue-600 text-white w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading && <Loader2 className="animate-spin" size={16} />} Create {role} account
            </button>
          </form>

          <p className="mt-6 text-sm text-center">
            Already have an account? <Link to="/login" className="font-semibold underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
