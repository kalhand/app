import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Bookmark, Search } from "lucide-react";
import { format } from "date-fns";

export default function SchoolWishlists() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/school/wishlists").then((r) => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((s) => {
    const hay = `${s.user_name} ${s.user_email} ${(s.careers || []).map((c) => c.career_title).join(" ")}`.toLowerCase();
    return !q || hay.includes(q.toLowerCase());
  });

  const totalBookmarks = items.reduce((a, s) => a + (s.careers?.length || 0), 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="label-mono flex items-center gap-2"><Bookmark size={14} strokeWidth={2.5} /> {user?.role === "principal" ? "Principal" : "Counselor"} · Wishlists</span>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">Student career bookmarks</h1>
            <p className="text-[#52525B] mt-2">Handy for parent-teacher meetings — see exactly which careers each student is dreaming about.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1 rounded-full border-2 border-[#0A0A0A] bg-[#A7F3D0]">{items.length} students</span>
            <span className="text-xs px-3 py-1 rounded-full border-2 border-[#0A0A0A] bg-[#FEF08A]">{totalBookmarks} bookmarks</span>
          </div>
        </div>

        <div className="mt-6 relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" strokeWidth={2.5} />
          <input
            data-testid="wishlists-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search student or career…"
            className="pl-10 pr-4 py-2 border-2 border-[#0A0A0A] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="label-mono">Loading…</div>
          ) : filtered.length === 0 ? (
            <div data-testid="wishlists-empty" className="card-brutal p-10 text-center bg-white text-sm text-[#52525B]">
              No student wishlists yet in your school.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filtered.map((s) => (
                <div key={s.user_id} data-testid={`wishlist-student-${s.user_id}`} className="card-brutal p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-xl font-bold">{s.user_name}</h3>
                      <p className="text-xs text-[#52525B]">{s.user_email} · Class {s.grade || "—"}</p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full border-2 border-[#0A0A0A] bg-[#FEF08A] font-semibold">
                      {s.careers.length} saved
                    </span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {s.careers.map((c, i) => (
                      <li key={i} className="flex items-center justify-between border-b border-[#0A0A0A]/10 py-2">
                        <span className="font-medium">{i + 1}. {c.career_title}</span>
                        <span className="text-xs text-[#52525B]">{format(new Date(c.added_at), "dd MMM")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
