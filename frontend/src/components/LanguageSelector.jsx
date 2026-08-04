import { LANGS, useLang } from "@/context/LanguageContext";
import { Languages } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function LanguageSelector() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGS.find((l) => l.code === lang) || LANGS[0];

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        data-testid="lang-toggle"
        onClick={() => setOpen((v) => !v)}
        className="btn-brutal bg-white px-3 py-2 text-sm flex items-center gap-1.5"
      >
        <Languages size={14} strokeWidth={2.5} /> {current.label}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border-2 border-[#0A0A0A] rounded-xl shadow-[4px_4px_0_0_rgba(10,10,10,1)] z-50 overflow-hidden">
          {LANGS.map((l) => (
            <button
              key={l.code}
              data-testid={`lang-${l.code}`}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-[#FEF08A] ${lang === l.code ? "font-bold bg-[#A7F3D0]" : ""}`}
            >
              {l.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
