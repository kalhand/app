import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { NEPBadge } from "@/lib/nep";
import { Briefcase, Clock, ExternalLink, Filter } from "lucide-react";

const TAG_COLOR = {
  Tech: "bg-[#E9D5FF]", STEM: "bg-[#A7F3D0]", Finance: "bg-[#FEF08A]",
  Creative: "bg-[#FFDDBF]", Social: "bg-[#A7F3D0]", Media: "bg-[#FEF08A]",
  Sustainability: "bg-[#A7F3D0]", Business: "bg-[#FFDDBF]", Health: "bg-[#E9D5FF]",
};

export default function Vocational() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tagFilter, setTagFilter] = useState("all");

  useEffect(() => {
    api.get("/vocational").then((r) => setItems(r.data.opportunities || [])).finally(() => setLoading(false));
  }, []);

  const tags = ["all", ...Array.from(new Set(items.map((i) => i.tag)))];
  const filtered = tagFilter === "all" ? items : items.filter((i) => i.tag === tagFilter);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="label-mono">Vocational · NEP 2020 § 4.9</span>
          <NEPBadge grade={user?.grade} />
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-3">
          Real-world exposure
        </h1>
        <p className="text-[#52525B] mt-2 max-w-2xl">
          NEP 2020 asks every student to try <b>at least one vocational course, internship, or hands-on project</b> between
          Grade 6 and 12. Here are curated opportunities relevant to Class {user?.grade || "—"}.
        </p>

        <div className="mt-6 flex items-center flex-wrap gap-2">
          <Filter size={14} strokeWidth={2.5} className="opacity-70" />
          {tags.map((t) => (
            <button
              key={t}
              data-testid={`vocational-tag-${t}`}
              onClick={() => setTagFilter(t)}
              className={`px-3 py-1.5 border-2 border-[#0A0A0A] rounded-full text-sm font-semibold ${tagFilter === t ? "bg-[#0A0A0A] text-white" : "bg-white"}`}
            >
              {t === "all" ? "All" : t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-10 label-mono">Loading opportunities…</div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 card-brutal p-8 text-center text-sm text-[#52525B]">
            No opportunities match this filter right now.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((o, i) => (
              <div key={i} data-testid={`vocational-card-${i}`} className="card-brutal p-6 flex flex-col">
                <div className="flex items-start justify-between">
                  <Briefcase strokeWidth={2.5} size={24} />
                  <span className={`text-xs px-2 py-1 border-2 border-[#0A0A0A] rounded-full ${TAG_COLOR[o.tag] || "bg-white"}`}>{o.tag}</span>
                </div>
                <h3 className="font-display text-lg font-bold mt-3">{o.title}</h3>
                <div className="mt-2 flex items-center gap-2 text-xs text-[#52525B]">
                  <span className="uppercase tracking-wider">{o.type}</span>
                  <span>·</span>
                  <Clock size={12} strokeWidth={2.5} /> {o.duration}
                </div>
                <p className="text-sm mt-3 text-[#52525B]">{o.provider}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {o.streams.map((s, k) => (
                    <span key={k} className="text-[11px] px-2 py-0.5 bg-[#FEF08A] border-2 border-[#0A0A0A] rounded-full">{s}</span>
                  ))}
                </div>
                <a href={o.url} target="_blank" rel="noreferrer"
                   data-testid={`vocational-link-${i}`}
                   className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-semibold underline underline-offset-4">
                  Explore <ExternalLink size={14} strokeWidth={2.5} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
