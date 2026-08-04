import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { Plus, Trash2, Pencil, X, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "personality", label: "Personality" },
  { value: "aptitude", label: "Aptitude" },
  { value: "interest", label: "Interest (RIASEC)" },
  { value: "mental_ability", label: "Mental Ability" },
];

const CAT_COLOR = {
  personality: "bg-[#FEF08A]",
  aptitude: "bg-[#A7F3D0]",
  interest: "bg-[#E9D5FF]",
  mental_ability: "bg-[#FFDDBF]",
};

const emptyForm = {
  category: "personality",
  text: "",
  options: ["", ""],
  trait_map: ["", ""],
  correct_index: null,
};

export default function AdminQuestions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/questions");
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (q) => {
    setEditing(q);
    setForm({
      category: q.category,
      text: q.text,
      options: [...q.options],
      trait_map: q.trait_map ? [...q.trait_map] : q.options.map(() => ""),
      correct_index: q.correct_index ?? null,
    });
    setShowForm(true);
  };

  const setOpt = (i, v) => {
    const opts = [...form.options];
    opts[i] = v;
    setForm({ ...form, options: opts });
  };
  const setTrait = (i, v) => {
    const t = [...form.trait_map];
    t[i] = v;
    setForm({ ...form, trait_map: t });
  };
  const addOpt = () => setForm({ ...form, options: [...form.options, ""], trait_map: [...form.trait_map, ""] });
  const removeOpt = (i) => {
    const opts = form.options.filter((_, x) => x !== i);
    const t = form.trait_map.filter((_, x) => x !== i);
    setForm({ ...form, options: opts, trait_map: t, correct_index: form.correct_index === i ? null : form.correct_index });
  };

  const save = async () => {
    if (!form.text.trim() || form.options.some((o) => !o.trim())) {
      toast.error("Fill question text and all options");
      return;
    }
    setSaving(true);
    const isTraitBased = form.category === "personality" || form.category === "interest";
    const payload = {
      category: form.category,
      text: form.text,
      options: form.options,
      trait_map: isTraitBased ? form.trait_map : null,
      correct_index: !isTraitBased ? form.correct_index : null,
    };
    try {
      if (editing) {
        await api.put(`/questions/${editing.id}`, payload);
        toast.success("Question updated");
      } else {
        await api.post("/questions", payload);
        toast.success("Question created");
      }
      setShowForm(false);
      load();
    } catch (e) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (q) => {
    if (!window.confirm("Delete this question?")) return;
    await api.delete(`/questions/${q.id}`);
    toast.success("Deleted");
    load();
  };

  const filtered = filter === "all" ? items : items.filter((q) => q.category === filter);
  const isTraitBased = form.category === "personality" || form.category === "interest";

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="label-mono">Admin</span>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">Question Bank</h1>
          </div>
          <button data-testid="new-question-btn" onClick={openNew} className="btn-brutal bg-blue-600 text-white px-5 py-3 flex items-center gap-2">
            <Plus size={18} strokeWidth={2.5} /> New Question
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[{ value: "all", label: "All" }, ...CATEGORIES].map((c) => (
            <button
              key={c.value}
              data-testid={`filter-${c.value}`}
              onClick={() => setFilter(c.value)}
              className={`px-3 py-1.5 border-2 border-[#0A0A0A] rounded-full text-sm font-semibold ${filter === c.value ? "bg-[#0A0A0A] text-white" : "bg-white"}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="label-mono">Loading…</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((q) => (
                <div key={q.id} data-testid={`question-item-${q.id}`} className={`card-brutal p-5 ${CAT_COLOR[q.category]}`}>
                  <div className="flex items-start justify-between">
                    <span className="label-mono">{q.category.replace("_", " ")}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(q)} data-testid={`edit-${q.id}`} className="p-1.5 bg-white border-2 border-[#0A0A0A] rounded-lg"><Pencil size={14} strokeWidth={2.5} /></button>
                      <button onClick={() => remove(q)} data-testid={`delete-${q.id}`} className="p-1.5 bg-white border-2 border-[#0A0A0A] rounded-lg"><Trash2 size={14} strokeWidth={2.5} /></button>
                    </div>
                  </div>
                  <p className="font-display font-bold mt-2">{q.text}</p>
                  <ul className="mt-3 text-sm space-y-1">
                    {q.options.map((o, i) => (
                      <li key={i} className={i === q.correct_index ? "font-bold" : ""}>
                        {String.fromCharCode(65 + i)}. {o}
                        {q.trait_map?.[i] && <span className="ml-2 text-xs opacity-70">→ {q.trait_map[i]}</span>}
                        {i === q.correct_index && <span className="ml-2 text-xs text-green-800">✓ correct</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {filtered.length === 0 && <div className="text-sm text-[#52525B]">No questions in this category.</div>}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="card-brutal bg-white p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-extrabold tracking-tight">{editing ? "Edit Question" : "New Question"}</h2>
              <button onClick={() => setShowForm(false)} data-testid="close-modal" className="p-2 border-2 border-[#0A0A0A] rounded-lg"><X size={16} strokeWidth={2.5} /></button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="label-mono block mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      data-testid={`form-cat-${c.value}`}
                      type="button"
                      onClick={() => setForm({ ...form, category: c.value, correct_index: null })}
                      className={`px-3 py-1.5 border-2 border-[#0A0A0A] rounded-full text-sm font-semibold ${form.category === c.value ? "bg-[#0A0A0A] text-white" : "bg-white"}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-mono block mb-2">Question text</label>
                <textarea
                  data-testid="form-question-text"
                  rows={2}
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="label-mono block mb-2">Options {isTraitBased ? "(with trait)" : "(mark the correct answer)"}</label>
                <div className="space-y-2">
                  {form.options.map((o, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 text-sm font-bold">{String.fromCharCode(65 + i)}</span>
                      <input
                        data-testid={`form-option-${i}`}
                        value={o}
                        onChange={(e) => setOpt(i, e.target.value)}
                        placeholder="Option text"
                        className="flex-1 px-3 py-2 border-2 border-[#0A0A0A] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {isTraitBased ? (
                        <input
                          data-testid={`form-trait-${i}`}
                          value={form.trait_map[i] || ""}
                          onChange={(e) => setTrait(i, e.target.value)}
                          placeholder="Trait (e.g. Extraversion)"
                          className="w-40 px-3 py-2 border-2 border-[#0A0A0A] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <button
                          type="button"
                          data-testid={`form-correct-${i}`}
                          onClick={() => setForm({ ...form, correct_index: i })}
                          className={`px-3 py-2 border-2 border-[#0A0A0A] rounded-lg text-xs font-bold ${form.correct_index === i ? "bg-[#A7F3D0]" : "bg-white"}`}
                        >
                          {form.correct_index === i ? "✓ correct" : "mark"}
                        </button>
                      )}
                      {form.options.length > 2 && (
                        <button type="button" onClick={() => removeOpt(i)} className="p-2 border-2 border-[#0A0A0A] rounded-lg bg-white"><Trash2 size={14} strokeWidth={2.5} /></button>
                      )}
                    </div>
                  ))}
                </div>
                {form.options.length < 6 && (
                  <button type="button" onClick={addOpt} data-testid="add-option-btn" className="mt-3 text-sm font-semibold underline">+ Add option</button>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button onClick={() => setShowForm(false)} className="btn-brutal bg-white px-5 py-2">Cancel</button>
                <button data-testid="save-question-btn" onClick={save} disabled={saving} className="btn-brutal bg-blue-600 text-white px-5 py-2 flex items-center gap-2">
                  {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} strokeWidth={2.5} />} Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
