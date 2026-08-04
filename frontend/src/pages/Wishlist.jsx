import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { toast } from "sonner";
import { Bookmark, Trash2, ArrowRight, Sparkles } from "lucide-react";
import { format } from "date-fns";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/wishlist/me").then((r) => setItems(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (title) => {
    if (!window.confirm(`Remove "${title}" from wishlist?`)) return;
    await api.delete(`/wishlist/${encodeURIComponent(title)}`);
    toast.success("Removed");
    load();
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <span className="label-mono flex items-center gap-2"><Bookmark size={14} strokeWidth={2.5} /> Wishlist</span>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">
              Careers you've saved
            </h1>
            <p className="text-[#52525B] mt-2 max-w-2xl">
              Bookmarks from your Career Deep-Dives — perfect to revisit before parent-teacher meetings and stream choices.
            </p>
          </div>
          {items.length >= 2 && (
            <Link to="/compare" data-testid="wishlist-compare-btn" className="btn-brutal bg-blue-600 text-white px-4 py-2 text-sm flex items-center gap-2">
              Compare 2 careers <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="mt-10 label-mono">Loading…</div>
        ) : items.length === 0 ? (
          <div data-testid="wishlist-empty" className="mt-10 card-brutal p-10 text-center bg-white">
            <Sparkles size={28} strokeWidth={2.5} className="mx-auto" />
            <p className="mt-3 text-sm text-[#52525B] max-w-md mx-auto">
              No bookmarks yet. Open any career from your AI report and tap the <b>Save</b> button to add it here.
            </p>
            <Link to="/dashboard" data-testid="wishlist-back-dashboard" className="btn-brutal bg-blue-600 text-white inline-flex items-center gap-2 px-5 py-3 mt-6">
              Go to Dashboard <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((w) => (
              <div key={w.id} data-testid={`wishlist-item-${w.id}`} className="card-brutal p-6 bg-[#FEF08A]">
                <div className="flex items-start justify-between">
                  <Bookmark strokeWidth={2.5} size={22} />
                  <button
                    data-testid={`wishlist-remove-${w.id}`}
                    onClick={() => remove(w.career_title)}
                    className="p-1.5 bg-white border-2 border-[#0A0A0A] rounded-lg"
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                </div>
                <h3 className="font-display text-xl font-bold mt-3">{w.career_title}</h3>
                {w.note && <p className="text-sm mt-2 text-[#52525B]">{w.note}</p>}
                <div className="text-xs text-[#52525B] mt-3">Saved {format(new Date(w.added_at), "dd MMM yyyy")}</div>
                <Link
                  to={`/career/${encodeURIComponent(w.career_title)}`}
                  data-testid={`wishlist-view-${w.id}`}
                  className="mt-4 btn-brutal bg-white inline-flex items-center gap-2 px-3 py-2 text-sm"
                >
                  Open deep-dive <ArrowRight size={14} strokeWidth={2.5} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
