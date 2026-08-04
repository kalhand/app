import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Sparkles, Brain, Target, LineChart, ArrowRight, GraduationCap, ShieldCheck } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

const HERO_IMG =
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85";
const NEP_IMG =
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=srgb&fm=jpg&w=1000&q=85";

const CATEGORIES = [
  { key: "personality", color: "bg-[#FEF08A]", icon: Sparkles },
  { key: "aptitude", color: "bg-[#A7F3D0]", icon: Target },
  { key: "interest", color: "bg-[#E9D5FF]", icon: Brain },
  { key: "mental", color: "bg-[#FFDDBF]", icon: LineChart },
];

export default function Landing() {
  const { t } = useLang();
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        <div className="md:col-span-7 flex flex-col justify-center">
          <span data-testid="hero-tag" className="label-mono inline-flex items-center gap-2 bg-[#FEF08A] border-2 border-[#0A0A0A] rounded-full px-3 py-1 w-fit">
            <Sparkles size={14} strokeWidth={2.5} /> {t("hero_tag")}
          </span>
          <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.02]">
            {t("hero_h1a")} <br />
            <span className="bg-[#A7F3D0] px-3 border-2 border-[#0A0A0A] rounded-xl inline-block rotate-[-1deg] mt-2">{t("hero_h1b")}</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-[#52525B] max-w-xl leading-relaxed">
            {t("hero_desc")}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register" data-testid="cta-get-started" className="btn-brutal bg-blue-600 text-white px-6 py-3 flex items-center gap-2">
              {t("hero_cta_primary")} <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
            <Link to="/login" data-testid="cta-login" className="btn-brutal bg-white px-6 py-3">
              {t("hero_cta_secondary")}
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-6 text-sm text-[#52525B]">
            <div className="flex items-center gap-2"><ShieldCheck size={16} strokeWidth={2.5} /> {t("hero_badge_private")}</div>
            <div className="flex items-center gap-2"><GraduationCap size={16} strokeWidth={2.5} /> {t("hero_badge_grades")}</div>
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="card-brutal p-3 rotate-[2deg] hover:rotate-0 transition-transform">
            <img
              src={HERO_IMG}
              alt="Indian school students in classroom"
              className="w-full h-[380px] object-cover rounded-xl border-2 border-[#0A0A0A]"
              onError={(e) => { e.currentTarget.src = "https://images.pexels.com/photos/8617969/pexels-photo-8617969.jpeg?auto=compress&cs=tinysrgb&w=1200"; }}
            />
            <div className="mt-4 px-2 pb-2 flex items-center justify-between">
              <span className="label-mono">{t("hero_image_caption")}</span>
              <span className="label-mono bg-[#E9D5FF] px-2 py-1 rounded-full border-2 border-[#0A0A0A]">NEP 2020</span>
            </div>
          </div>
        </div>
      </section>

      {/* NEP 2020 explainer */}
      <section id="nep" className="border-y-2 border-[#0A0A0A] bg-[#FEF08A]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-7">
            <span className="label-mono inline-flex items-center gap-2 bg-white border-2 border-[#0A0A0A] rounded-full px-3 py-1">
              {t("nep_kicker")}
            </span>
            <h2 className="mt-5 font-display text-3xl md:text-5xl font-extrabold tracking-tighter leading-[1.05]">
              {t("nep_h2a")}<br />{t("nep_h2b")} <span className="bg-[#A7F3D0] px-2 border-2 border-[#0A0A0A] rounded-xl inline-block rotate-[-1deg]">{t("nep_h2c")}</span>
            </h2>
            <p className="mt-6 text-base md:text-lg leading-relaxed max-w-2xl">{t("nep_desc")}</p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="border-2 border-[#0A0A0A] rounded-xl p-4 bg-white">
                  <div className="label-mono">{t(`nep_pillar${n}_t`)}</div>
                  <p className="text-sm mt-2 text-[#0A0A0A]/80">{t(`nep_pillar${n}_d`)}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 card-brutal p-5 bg-[#A7F3D0]">
              <span className="label-mono">{t("nep_how_kicker")}</span>
              <p className="text-sm mt-2 leading-relaxed">{t("nep_how_desc")}</p>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="card-brutal p-3 rotate-[-2deg] hover:rotate-0 transition-transform bg-white">
              <img
                src={NEP_IMG}
                alt="Indian students in a school library"
                className="w-full h-[420px] object-cover rounded-xl border-2 border-[#0A0A0A]"
                onError={(e) => { e.currentTarget.src = "https://images.pexels.com/photos/8617731/pexels-photo-8617731.jpeg?auto=compress&cs=tinysrgb&w=1200"; }}
              />
              <div className="mt-4 px-2 pb-2 flex items-center justify-between">
                <span className="label-mono">{t("nep_image_caption")}</span>
                <span className="label-mono bg-[#FEF08A] px-2 py-1 rounded-full border-2 border-[#0A0A0A]">2020</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="label-mono">{t("cats_kicker")}</span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-2">{t("cats_h2")}</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {CATEGORIES.map((c, i) => (
            <div key={c.key} data-testid={`category-card-${c.key}`} className={`card-brutal p-6 ${c.color}`}>
              <c.icon strokeWidth={2.5} size={28} />
              <div className="label-mono mt-4">{t("section")} {i + 1}</div>
              <h3 className="font-display text-2xl font-bold mt-1">{t(`cat_${c.key}`)}</h3>
              <p className="text-sm mt-2 text-[#0A0A0A]/80">{t(`cat_${c.key}_d`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <span className="label-mono">{t("how_kicker")}</span>
        <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-2 mb-8">{t("how_h2")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card-brutal p-8">
              <span className="font-display text-5xl font-extrabold text-blue-600">{String(n).padStart(2, "0")}</span>
              <h3 className="mt-3 font-display text-xl font-bold">{t(`how${n}_t`)}</h3>
              <p className="text-sm mt-2 text-[#52525B]">{t(`how${n}_d`)}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t-2 border-[#0A0A0A] mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <span>© {new Date().getFullYear()} PathfinderAiClub — {t("footer_copy")}</span>
          <span className="label-mono">{t("footer_care")}</span>
        </div>
      </footer>
    </div>
  );
}
