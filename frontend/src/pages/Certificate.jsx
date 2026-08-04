import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { Compass, Printer, ArrowLeft, Award, Sparkles } from "lucide-react";
import { format } from "date-fns";

export default function Certificate() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/results/${id}`).then((r) => setData(r.data));
  }, [id]);

  useEffect(() => {
    document.body.classList.add("bg-white");
    return () => document.body.classList.remove("bg-white");
  }, []);

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center label-mono">Loading certificate…</div>;
  }

  const topCareer = data.ai_report?.top_careers?.[0]?.title || "Multidisciplinary Explorer";
  const stream = (data.ai_report?.recommended_stream || "").split("—")[0].trim();
  const date = format(new Date(data.created_at), "dd MMMM yyyy");

  return (
    <div className="min-h-screen bg-white">
      {/* Toolbar (hidden on print) */}
      <div className="print:hidden max-w-5xl mx-auto px-4 md:px-8 py-6 flex justify-between items-center">
        <Link to="/dashboard" data-testid="cert-back-btn" className="btn-brutal bg-white px-4 py-2 text-sm flex items-center gap-2">
          <ArrowLeft size={14} strokeWidth={2.5} /> Back
        </Link>
        <button data-testid="cert-print-btn" onClick={() => window.print()} className="btn-brutal bg-[#0A0A0A] text-white px-4 py-2 text-sm flex items-center gap-2">
          <Printer size={14} strokeWidth={2.5} /> Download / Print
        </button>
      </div>

      {/* Certificate paper */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-16">
        <div id="certificate" className="relative border-[6px] border-[#0A0A0A] rounded-2xl bg-white p-8 md:p-14 overflow-hidden shadow-[8px_8px_0_0_rgba(10,10,10,1)]">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#FEF08A] border-r-[6px] border-b-[6px] border-[#0A0A0A] rotate-0 rounded-br-3xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#A7F3D0] border-l-[6px] border-t-[6px] border-[#0A0A0A] rounded-tl-3xl"></div>
          <div className="absolute top-6 right-6 label-mono bg-[#E9D5FF] px-3 py-1 border-2 border-[#0A0A0A] rounded-full">NEP 2020 aligned</div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 mt-4">
              <div className="w-10 h-10 bg-[#FEF08A] border-2 border-[#0A0A0A] rounded-xl flex items-center justify-center rotate-[-4deg]">
                <Compass strokeWidth={2.5} size={22} />
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tight">PathfinderAiClub</span>
            </div>

            <div className="mt-6 label-mono">Certificate of Career Discovery</div>
            <h1 className="mt-3 font-display text-3xl md:text-6xl font-extrabold tracking-tighter leading-[0.95]">
              This certifies that
            </h1>

            <div className="mt-6 mx-auto max-w-3xl">
              <div className="inline-block bg-[#FEF08A] border-2 border-[#0A0A0A] rounded-2xl px-6 md:px-10 py-3 md:py-4 rotate-[-1deg]">
                <h2 data-testid="cert-name" className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">{data.user_name}</h2>
              </div>
              <p className="mt-6 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
                has completed the PathfinderAiClub psychometric &amp; career assessment on <b>{date}</b> and has been identified with a
                strong aptitude for
              </p>
              <div className="mt-6">
                <div className="inline-flex items-center gap-2 bg-[#A7F3D0] border-2 border-[#0A0A0A] rounded-full px-4 py-2">
                  <Award strokeWidth={2.5} size={18} />
                  <span data-testid="cert-career" className="font-display font-extrabold text-xl md:text-2xl">{topCareer}</span>
                </div>
              </div>
              {stream && (
                <p className="mt-4 text-sm text-[#52525B]">
                  Recommended stream: <b>{stream}</b>
                </p>
              )}
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="border-2 border-[#0A0A0A] rounded-xl p-4 bg-white">
                <div className="label-mono">Class</div>
                <div className="font-display font-extrabold text-lg mt-1">{data.grade || "—"}</div>
              </div>
              <div className="border-2 border-[#0A0A0A] rounded-xl p-4 bg-white">
                <div className="label-mono">Board</div>
                <div className="font-display font-extrabold text-lg mt-1">{data.education_board || "—"}</div>
              </div>
              <div className="border-2 border-[#0A0A0A] rounded-xl p-4 bg-white">
                <div className="label-mono">School</div>
                <div className="font-display font-extrabold text-sm md:text-base mt-1">{data.school_name || "—"}</div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 items-end max-w-3xl mx-auto gap-6">
              <div className="text-left">
                <div className="border-b-2 border-[#0A0A0A] w-full h-8 flex items-end pb-1 font-signature italic text-xl">PathfinderAiClub</div>
                <div className="label-mono mt-2">Authorized signatory</div>
              </div>
              <div className="text-right">
                <div className="border-b-2 border-[#0A0A0A] w-full h-8 flex items-end justify-end pb-1 label-mono">{data.id.slice(0, 8).toUpperCase()}</div>
                <div className="label-mono mt-2">Certificate ID</div>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-center gap-2 text-xs text-[#52525B]">
              <Sparkles size={12} strokeWidth={2.5} /> AI-Generated Career Discovery · {date}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
