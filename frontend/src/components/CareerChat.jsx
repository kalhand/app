import { useState, useRef, useEffect } from "react";
import api from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { MessageCircle, Send, X, Loader2, Sparkles } from "lucide-react";

const PLACEHOLDER = {
  en: "Ask anything about this career…",
  hi: "इस करियर के बारे में कुछ भी पूछें…",
  pa: "ਇਸ ਕੈਰੀਅਰ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ…",
};

const STARTER = {
  en: [
    "What entrance exams do I need?",
    "Which subjects should I pick in Class 11?",
    "Is this career good for my grades?",
    "Any Indian institutes I can aim for?",
  ],
  hi: [
    "मुझे कौन-सी प्रवेश परीक्षा देनी होगी?",
    "कक्षा 11 में कौन-से विषय लूँ?",
    "क्या मेरे अंकों के लिए यह करियर ठीक है?",
    "कौन से भारतीय संस्थान लक्ष्य रखूँ?",
  ],
  pa: [
    "ਮੈਨੂੰ ਕਿਹੜੀਆਂ ਦਾਖਲਾ ਪ੍ਰੀਖਿਆਵਾਂ ਦੇਣੀਆਂ ਪੈਣਗੀਆਂ?",
    "11ਵੀਂ ਜਮਾਤ ਵਿੱਚ ਕਿਹੜੇ ਵਿਸ਼ੇ ਚੁਣਾਂ?",
    "ਕੀ ਮੇਰੇ ਨੰਬਰਾਂ ਲਈ ਇਹ ਕੈਰੀਅਰ ਸਹੀ ਹੈ?",
    "ਕਿਹੜੇ ਭਾਰਤੀ ਸੰਸਥਾਨਾਂ ਦੀ ਟੀਚੇ ਬਣਾਵਾਂ?",
  ],
};

export default function CareerChat({ careerTitle }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const ask = async (q) => {
    const question = (q || input).trim();
    if (!question || sending) return;
    setInput("");
    const nextMsgs = [...messages, { role: "user", content: question }];
    setMessages(nextMsgs);
    setSending(true);
    try {
      const { data } = await api.post("/careers/chat", {
        career_title: careerTitle,
        question,
        history: messages,
        language: lang,
      });
      setMessages([...nextMsgs, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setMessages([...nextMsgs, { role: "assistant", content: "Sorry, I couldn't answer that right now. Please try again." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating open button */}
      {!open && (
        <button
          data-testid="chat-open-btn"
          onClick={() => setOpen(true)}
          className="print:hidden fixed bottom-6 right-6 z-40 btn-brutal bg-blue-600 text-white pl-4 pr-5 py-3 flex items-center gap-2"
        >
          <MessageCircle size={18} strokeWidth={2.5} /> Ask AI Counselor
        </button>
      )}

      {/* Drawer */}
      {open && (
        <div className="print:hidden fixed bottom-0 right-0 md:bottom-6 md:right-6 z-40 w-full md:w-[420px] max-h-[80vh] card-brutal bg-white flex flex-col rounded-t-2xl md:rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b-2 border-[#0A0A0A] bg-[#FEF08A]">
            <div className="flex items-center gap-2">
              <Sparkles strokeWidth={2.5} size={18} />
              <div>
                <div className="font-display font-extrabold text-sm">AI Counselor</div>
                <div className="text-[11px] text-[#52525B] line-clamp-1">Chatting about {careerTitle}</div>
              </div>
            </div>
            <button data-testid="chat-close-btn" onClick={() => setOpen(false)} className="p-2 border-2 border-[#0A0A0A] rounded-lg bg-white">
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAF9]">
            {messages.length === 0 && (
              <div>
                <p className="text-sm text-[#52525B] mb-3">Try one of these:</p>
                <div className="space-y-2">
                  {(STARTER[lang] || STARTER.en).map((s, i) => (
                    <button
                      key={i}
                      data-testid={`chat-starter-${i}`}
                      onClick={() => ask(s)}
                      className="w-full text-left text-sm px-3 py-2 bg-white border-2 border-[#0A0A0A] rounded-xl hover:bg-[#FEF08A]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} data-testid={`chat-msg-${i}`} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl border-2 border-[#0A0A0A] text-sm whitespace-pre-wrap ${
                  m.role === "user" ? "bg-blue-600 text-white" : "bg-white"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-3 py-2 rounded-xl border-2 border-[#0A0A0A] bg-white text-sm flex items-center gap-2">
                  <Loader2 className="animate-spin" size={14} /> thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); ask(); }}
            className="p-3 border-t-2 border-[#0A0A0A] bg-white flex items-center gap-2"
          >
            <input
              data-testid="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={PLACEHOLDER[lang] || PLACEHOLDER.en}
              className="flex-1 px-3 py-2 border-2 border-[#0A0A0A] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              data-testid="chat-send-btn"
              disabled={sending || !input.trim()}
              className="btn-brutal bg-blue-600 text-white p-2 disabled:opacity-60"
              aria-label="Send"
            >
              <Send size={16} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
