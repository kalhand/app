import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { toast } from "sonner";
import { Save, Loader2, Palette, Upload } from "lucide-react";

const PRESETS = ["#0e4d92", "#c62828", "#2e7d32", "#6a1b9a", "#e65100", "#0A0A0A", "#f59e0b", "#2563EB"];

export default function UniversityBranding() {
  const [form, setForm] = useState({ logo_url: "", headline_color: "#2563EB", tagline: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/university/branding")
      .then((r) => setForm({
        logo_url: r.data.logo_url || "",
        headline_color: r.data.headline_color || "#2563EB",
        tagline: r.data.tagline || "",
      }))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/university/branding", form);
      toast.success("Branding updated — visible on every student report");
    } catch (e) {
      toast.error("Could not save branding");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
        <span className="label-mono">University · Branding</span>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">Your identity, everywhere</h1>
        <p className="text-[#52525B] mt-2 max-w-2xl">
          Upload your logo, pick a headline colour, and add a tagline. Every student report generated for schools you onboard
          will proudly carry your branding.
        </p>

        {loading ? (
          <div className="mt-10 label-mono">Loading…</div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <form onSubmit={save} className="card-brutal p-6 space-y-5">
              <div>
                <label className="label-mono block mb-2 flex items-center gap-1"><Upload size={12} strokeWidth={2.5} /> Logo URL</label>
                <input
                  data-testid="brand-logo-url"
                  type="url"
                  placeholder="https://your-site.com/logo.png"
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-[#52525B] mt-1">Paste a hosted URL. PNG or SVG with transparent background recommended.</p>
              </div>

              <div>
                <label className="label-mono block mb-2 flex items-center gap-1"><Palette size={12} strokeWidth={2.5} /> Headline colour</label>
                <div className="flex items-center gap-3">
                  <input
                    data-testid="brand-color"
                    type="color"
                    value={form.headline_color}
                    onChange={(e) => setForm({ ...form, headline_color: e.target.value })}
                    className="h-12 w-16 border-2 border-[#0A0A0A] rounded-lg bg-white cursor-pointer"
                  />
                  <input
                    value={form.headline_color}
                    onChange={(e) => setForm({ ...form, headline_color: e.target.value })}
                    className="px-3 py-2 border-2 border-[#0A0A0A] rounded-xl font-mono bg-white focus:outline-none"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      data-testid={`brand-preset-${c.slice(1)}`}
                      onClick={() => setForm({ ...form, headline_color: c })}
                      style={{ background: c }}
                      className="w-8 h-8 border-2 border-[#0A0A0A] rounded-full"
                      aria-label={`Set colour ${c}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="label-mono block mb-2">Tagline (optional)</label>
                <input
                  data-testid="brand-tagline"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  placeholder="e.g. Empowering every Punjabi student"
                  maxLength={80}
                  className="w-full px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                data-testid="brand-save"
                className="btn-brutal bg-blue-600 text-white px-5 py-3 flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} strokeWidth={2.5} />} Save branding
              </button>
            </form>

            {/* Preview */}
            <div className="card-brutal p-6" style={{ borderColor: "#0A0A0A" }}>
              <span className="label-mono">Live preview</span>
              <div className="mt-4 border-2 border-[#0A0A0A] rounded-xl p-6 bg-white" style={{ borderLeftWidth: 8, borderLeftColor: form.headline_color || "#0A0A0A" }}>
                <div className="flex items-center gap-3">
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="logo" className="h-10 max-w-[120px] object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div className="h-10 w-10 rounded-lg border-2 border-[#0A0A0A]" style={{ background: form.headline_color || "#0A0A0A" }} />
                  )}
                  <div>
                    <div className="label-mono">Powered by</div>
                    <div className="font-display font-extrabold text-lg" style={{ color: form.headline_color || "#0A0A0A" }}>
                      Your University
                    </div>
                  </div>
                </div>
                {form.tagline && <p className="text-sm mt-4 italic">"{form.tagline}"</p>}
                <div className="mt-6 border-t-2 border-[#0A0A0A]/20 pt-4">
                  <div className="label-mono">Sample AI Career Report</div>
                  <div className="font-display font-extrabold text-2xl mt-1" style={{ color: form.headline_color || "#0A0A0A" }}>
                    Aarav — Class 10
                  </div>
                  <p className="text-sm text-[#52525B] mt-2">
                    Recommended stream: Science (PCM) — top career: Software Engineer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
