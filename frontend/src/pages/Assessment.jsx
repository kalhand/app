import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { NEPBadge } from "@/lib/nep";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";

const CATEGORY_META = {
  personality: { label: "Personality", color: "bg-[#FEF08A]" },
  aptitude: { label: "Aptitude", color: "bg-[#A7F3D0]" },
  interest: { label: "Interest", color: "bg-[#E9D5FF]" },
  mental_ability: { label: "Mental Ability", color: "bg-[#FFDDBF]" },
};

export default function Assessment() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { lang } = useLang();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // qid -> selected_index
  const [i, setI] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/questions").then((r) => {
      // shuffle categories so it feels varied but grouped
      const order = ["personality", "interest", "aptitude", "mental_ability"];
      const sorted = [...r.data].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
      setQuestions(sorted);
    }).finally(() => setLoading(false));
  }, []);

  const q = questions[i];
  const total = questions.length;
  const progress = total ? Math.round((Object.keys(answers).length / total) * 100) : 0;
  const selected = q ? answers[q.id] : undefined;

  // Localized text + options based on current language
  const localized = (() => {
    if (!q) return { text: "", options: [] };
    const tr = q.translations && q.translations[lang];
    if (tr && tr.text && Array.isArray(tr.options) && tr.options.length === q.options.length) {
      return { text: tr.text, options: tr.options };
    }
    return { text: q.text, options: q.options };
  })();

  const select = (idx) => {
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: idx }));
  };

  const canGoNext = useMemo(() => selected !== undefined && i < total - 1, [selected, i, total]);
  const canSubmit = useMemo(() => Object.keys(answers).length === total && total > 0, [answers, total]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([question_id, selected_index]) => ({ question_id, selected_index })),
        language: lang,
      };
      const { data } = await api.post("/assessment/submit", payload);
      toast.success("Your AI report is ready!");
      nav(`/report/${data.id}`);
    } catch (e) {
      toast.error("Failed to submit. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 label-mono">Loading questions…</div>
      </div>
    );
  }

  if (!q) return null;
  const meta = CATEGORY_META[q.category] || { label: q.category, color: "bg-white" };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
        {/* NEP + grade banner */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <NEPBadge grade={user?.grade} />
          <span className="label-mono text-[#52525B]">Class {user?.grade || "—"} · {user?.education_board || "Board N/A"}</span>
        </div>
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="label-mono">Question {i + 1} of {total}</span>
            <span data-testid="assessment-progress" className="label-mono">{progress}% complete</span>
          </div>
          <div className="h-3 w-full bg-white border-2 border-[#0A0A0A] rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`card-brutal p-8 ${meta.color}`}
          >
            <span className="label-mono">{meta.label}</span>
            <h2 data-testid="question-text" className="font-display text-2xl md:text-3xl font-extrabold tracking-tight mt-3 leading-snug">
              {localized.text}
            </h2>

            <div className="mt-8 grid grid-cols-1 gap-3">
              {localized.options.map((opt, idx) => {
                const isSel = selected === idx;
                return (
                  <button
                    key={idx}
                    data-testid={`option-${idx}`}
                    onClick={() => select(idx)}
                    className={`text-left w-full border-2 border-[#0A0A0A] rounded-xl px-5 py-4 font-medium transition-transform ${
                      isSel ? "bg-blue-600 text-white translate-x-1" : "bg-white hover:-translate-y-0.5"
                    }`}
                  >
                    <span className="label-mono opacity-70 mr-3">{String.fromCharCode(65 + idx)}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Nav */}
        <div className="mt-8 flex items-center justify-between">
          <button
            data-testid="prev-btn"
            onClick={() => setI((x) => Math.max(0, x - 1))}
            disabled={i === 0}
            className="btn-brutal bg-white px-5 py-3 flex items-center gap-2 disabled:opacity-40"
          >
            <ArrowLeft size={16} strokeWidth={2.5} /> Previous
          </button>

          {i < total - 1 ? (
            <button
              data-testid="next-btn"
              onClick={() => setI((x) => Math.min(total - 1, x + 1))}
              disabled={selected === undefined}
              className="btn-brutal bg-[#0A0A0A] text-white px-5 py-3 flex items-center gap-2 disabled:opacity-40"
            >
              Next <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          ) : (
            <button
              data-testid="submit-assessment-btn"
              onClick={submit}
              disabled={!canSubmit || submitting}
              className="btn-brutal bg-blue-600 text-white px-6 py-3 flex items-center gap-2 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} strokeWidth={2.5} />}
              {submitting ? "AI is analyzing…" : "Get AI Report"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
