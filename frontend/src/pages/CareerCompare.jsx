import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { Loader2, ArrowLeftRight, DollarSign, BookOpen, GraduationCap, TrendingUp, Building, ArrowRight } from "lucide-react";

function CareerColumn({ data, side, loading }) {
  if (loading) return (
    <div className="card-brutal p-6 flex items-center gap-3">
      <Loader2 className="animate-spin" size={16} /> <span className="label-mono">Loading…</span>
    </div>
  );
  if (!data) return null;
  const color = side === "left" ? "bg-[#FEF08A]" : "bg-[#A7F3D0]";
  return (
    <div className={`card-brutal p-6 ${color}`}>
      <span className="label-mono">Career {side === "left" ? "A" : "B"}</span>
      <h2 data-testid={`compare-${side}-title`} className="font-display text-2xl md:text-3xl font-extrabold tracking-tight mt-2">{data.title}</h2>
      <p className="text-sm mt-2">{data.one_liner}</p>

      <div className="mt-5 space-y-4">
        <div className="border-2 border-[#0A0A0A] rounded-xl p-3 bg-white">
          <div className="label-mono flex items-center gap-1"><GraduationCap size={12} strokeWidth={2.5} /> Recommended stream</div>
          <div className="font-semibold mt-1">{data.recommended_stream}</div>
        </div>

        <div className="border-2 border-[#0A0A0A] rounded-xl p-3 bg-white">
          <div className="label-mono flex items-center gap-1"><BookOpen size={12} strokeWidth={2.5} /> Key subjects</div>
          <div className="mt-2 flex flex-wrap gap-1">
            {(data.key_subjects || []).map((s, i) => <span key={i} className="text-xs px-2 py-1 bg-[#FAFAF9] border-2 border-[#0A0A0A] rounded-full">{s}</span>)}
          </div>
        </div>

        <div className="border-2 border-[#0A0A0A] rounded-xl p-3 bg-white">
          <div className="label-mono flex items-center gap-1"><TrendingUp size={12} strokeWidth={2.5} /> Core skills</div>
          <ul className="mt-2 space-y-1 text-sm">
            {(data.core_skills || []).slice(0, 5).map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>

        <div className="border-2 border-[#0A0A0A] rounded-xl p-3 bg-white">
          <div className="label-mono flex items-center gap-1"><DollarSign size={12} strokeWidth={2.5} /> Salary in India (INR)</div>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between border-b border-[#0A0A0A]/10 pb-1"><span>Entry</span><b>{data.salary_bands_inr?.entry_level || "—"}</b></div>
            <div className="flex justify-between border-b border-[#0A0A0A]/10 pb-1"><span>Mid</span><b>{data.salary_bands_inr?.mid_career || "—"}</b></div>
            <div className="flex justify-between"><span>Senior</span><b>{data.salary_bands_inr?.senior || "—"}</b></div>
          </div>
        </div>

        <div className="border-2 border-[#0A0A0A] rounded-xl p-3 bg-white">
          <div className="label-mono flex items-center gap-1"><Building size={12} strokeWidth={2.5} /> Top Indian institutes</div>
          <ol className="mt-2 space-y-1 text-sm list-decimal ml-4">
            {(data.top_indian_institutes || []).slice(0, 4).map((n, i) => <li key={i}>{n}</li>)}
          </ol>
        </div>

        <div className="border-2 border-[#0A0A0A] rounded-xl p-3 bg-white">
          <div className="label-mono">5-10 year outlook</div>
          <p className="text-sm mt-2">{data.growth_outlook}</p>
        </div>
      </div>

      <Link to={`/career/${encodeURIComponent(data.title)}`} className="btn-brutal bg-white mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm">
        Full deep-dive <ArrowRight size={14} strokeWidth={2.5} />
      </Link>
    </div>
  );
}

export default function CareerCompare() {
  const { a, b } = useParams();
  const { user } = useAuth();
  const { lang } = useLang();
  const nav = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [pickA, setPickA] = useState(a ? decodeURIComponent(a) : "");
  const [pickB, setPickB] = useState(b ? decodeURIComponent(b) : "");

  useEffect(() => {
    api.get("/wishlist/me").then((r) => setWishlist(r.data)).catch(() => {});
  }, []);

  const fetchCareer = (title, setter, setBusy) => {
    if (!title) return;
    setBusy(true);
    api.post("/careers/explore", {
      title, grade: user?.grade, education_board: user?.education_board, language: lang,
    })
      .then((r) => setter(r.data))
      .catch(() => setter(null))
      .finally(() => setBusy(false));
  };

  useEffect(() => {
    if (a) fetchCareer(decodeURIComponent(a), setDataA, setLoadingA);
    if (b) fetchCareer(decodeURIComponent(b), setDataB, setLoadingB);
    // eslint-disable-next-line
  }, [a, b, lang, user?.id]);

  const canCompare = pickA && pickB && pickA !== pickB;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <span className="label-mono flex items-center gap-2"><ArrowLeftRight size={14} strokeWidth={2.5} /> Compare careers</span>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">Two careers, side by side</h1>
        <p className="text-[#52525B] mt-2 max-w-2xl">Pick any two careers from your wishlist to see subjects, salary, colleges and outlook next to each other.</p>

        {/* Picker (only if not preloaded) */}
        {(!a || !b) && (
          <div className="mt-8 card-brutal p-6 bg-[#FEF08A]">
            <span className="label-mono">Choose two careers from your wishlist</span>
            {wishlist.length < 2 ? (
              <div className="mt-4 text-sm text-[#52525B]">
                You need at least 2 careers in your wishlist. <Link to="/wishlist" className="underline font-semibold">Add more →</Link>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <select data-testid="compare-pick-a" value={pickA} onChange={(e) => setPickA(e.target.value)}
                  className="px-3 py-2 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none">
                  <option value="">Pick career A</option>
                  {wishlist.map((w) => <option key={w.id} value={w.career_title}>{w.career_title}</option>)}
                </select>
                <select data-testid="compare-pick-b" value={pickB} onChange={(e) => setPickB(e.target.value)}
                  className="px-3 py-2 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none">
                  <option value="">Pick career B</option>
                  {wishlist.map((w) => <option key={w.id} value={w.career_title}>{w.career_title}</option>)}
                </select>
                <button
                  data-testid="compare-go"
                  disabled={!canCompare}
                  onClick={() => nav(`/compare/${encodeURIComponent(pickA)}/${encodeURIComponent(pickB)}`)}
                  className="btn-brutal bg-blue-600 text-white px-4 py-2 disabled:opacity-60"
                >
                  Compare
                </button>
              </div>
            )}
          </div>
        )}

        {(a || b) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <CareerColumn data={dataA} side="left" loading={loadingA} />
            <CareerColumn data={dataB} side="right" loading={loadingB} />
          </div>
        )}
      </div>
    </div>
  );
}
