import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Sparkles, Brain, Target, LineChart, ArrowRight, GraduationCap, ShieldCheck } from "lucide-react";

const HERO_IMG =
  "https://images.unsplash.com/photo-1571643829392-9a9a826a2a21?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwzfHxoaWdoJTIwc2Nob29sJTIwc3R1ZGVudCUyMHN0dWR5aW5nJTIwc21pbGluZ3xlbnwwfHx8fDE3ODUzMTI5MjB8MA&ixlib=rb-4.1.0&q=85";

const CATEGORIES = [
  { key: "personality", label: "Personality", color: "bg-[#FEF08A]", icon: Sparkles, desc: "Big-Five inspired traits" },
  { key: "aptitude", label: "Aptitude", color: "bg-[#A7F3D0]", icon: Target, desc: "Logic, verbal & numerical" },
  { key: "interest", label: "Interest (RIASEC)", color: "bg-[#E9D5FF]", icon: Brain, desc: "What you love doing" },
  { key: "mental", label: "Mental Ability", color: "bg-[#FFDDBF]", icon: LineChart, desc: "Memory & pattern recognition" },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        <div className="md:col-span-7 flex flex-col justify-center">
          <span data-testid="hero-tag" className="label-mono inline-flex items-center gap-2 bg-[#FEF08A] border-2 border-[#0A0A0A] rounded-full px-3 py-1 w-fit">
            <Sparkles size={14} strokeWidth={2.5} /> AI-Powered Career Guidance
          </span>
          <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.02]">
            Find the career <br />
            <span className="bg-[#A7F3D0] px-3 border-2 border-[#0A0A0A] rounded-xl inline-block rotate-[-1deg] mt-2">that fits you</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-[#52525B] max-w-xl leading-relaxed">
            A friendly psychometric assessment for school students. Answer honest questions on personality, aptitude,
            interests & mental ability — Pathfinder AI analyzes it all and reveals your best-fit career paths.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register" data-testid="cta-get-started" className="btn-brutal bg-blue-600 text-white px-6 py-3 flex items-center gap-2">
              Start Free Assessment <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
            <Link to="/login" data-testid="cta-login" className="btn-brutal bg-white px-6 py-3">
              I already have an account
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-6 text-sm text-[#52525B]">
            <div className="flex items-center gap-2"><ShieldCheck size={16} strokeWidth={2.5} /> Private & Secure</div>
            <div className="flex items-center gap-2"><GraduationCap size={16} strokeWidth={2.5} /> Built for Grades 8–12</div>
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="card-brutal p-3 rotate-[2deg] hover:rotate-0 transition-transform">
            <img
              src={HERO_IMG}
              alt="Student smiling"
              className="w-full h-[380px] object-cover rounded-xl border-2 border-[#0A0A0A]"
            />
            <div className="mt-4 px-2 pb-2 flex items-center justify-between">
              <span className="label-mono">Real students. Real futures.</span>
              <span className="label-mono bg-[#E9D5FF] px-2 py-1 rounded-full border-2 border-[#0A0A0A]">v1.0</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="label-mono">What we measure</span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-2">4 dimensions. 1 AI report.</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {CATEGORIES.map((c, i) => (
            <div key={c.key} data-testid={`category-card-${c.key}`} className={`card-brutal p-6 ${c.color}`}>
              <c.icon strokeWidth={2.5} size={28} />
              <div className="label-mono mt-4">Section {i + 1}</div>
              <h3 className="font-display text-2xl font-bold mt-1">{c.label}</h3>
              <p className="text-sm mt-2 text-[#0A0A0A]/80">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <span className="label-mono">How it works</span>
        <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-2 mb-8">Three simple steps.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { n: "01", t: "Answer honestly", d: "Take a ~10-minute mixed assessment across 4 dimensions." },
            { n: "02", t: "AI analyzes", d: "Claude Sonnet 4.5 reads your patterns and traits." },
            { n: "03", t: "Get your path", d: "Careers, strengths, subjects to pick, and a 3-stage roadmap." },
          ].map((s) => (
            <div key={s.n} className="card-brutal p-8">
              <span className="font-display text-5xl font-extrabold text-blue-600">{s.n}</span>
              <h3 className="mt-3 font-display text-xl font-bold">{s.t}</h3>
              <p className="text-sm mt-2 text-[#52525B]">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t-2 border-[#0A0A0A] mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <span>© {new Date().getFullYear()} Pathfinder AI — for students, by educators.</span>
          <span className="label-mono">Made with care</span>
        </div>
      </footer>
    </div>
  );
}
