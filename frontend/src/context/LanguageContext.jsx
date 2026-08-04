import { createContext, useContext, useEffect, useState } from "react";

const LangContext = createContext(null);

export const LANGS = [
  { code: "en", label: "EN", name: "English" },
  { code: "hi", label: "हि", name: "हिंदी (Hindi)" },
  { code: "pa", label: "ਪੰ", name: "ਪੰਜਾਬੀ (Punjabi)" },
];

// UI string translations. AI-generated content is translated server-side.
const STRINGS = {
  en: {
    login: "Login", get_started: "Get Started", logout: "Logout",
    dashboard: "Dashboard", assessment: "Assessment", vocational: "Vocational",
    my_children: "My Children", school_overview: "School Overview",
    students: "Students", bulk_upload: "Bulk Upload", class_report: "Class Report",
    school_dashboard: "School Dashboard", admin: "Admin", questions: "Questions",
    results: "Results",
    start_assessment: "Start Assessment", retake_assessment: "Retake Assessment",
    hi_greeting: "Hi", class_: "Class", board: "Board", school: "School",
    take_assessment_title: "Take your career assessment",
    retake_title: "Retake your assessment",
    past_reports: "Past reports", your_history: "Your history",
    no_assessments: "No assessments yet. Take your first one above!",
    what_youll_get: "What you'll get (NEP-aligned)",
    save_pdf: "Save / Print PDF",
    top_careers: "Careers that fit you",
    ai_career_report: "AI Career Report",
    explore_career: "Explore career",
    print_report: "Print / Save PDF",
    recommended_stream: "Recommended stream",
    language: "Language",
  },
  hi: {
    login: "लॉगिन", get_started: "शुरू करें", logout: "लॉगआउट",
    dashboard: "डैशबोर्ड", assessment: "मूल्यांकन", vocational: "व्यावसायिक",
    my_children: "मेरे बच्चे", school_overview: "स्कूल सारांश",
    students: "छात्र", bulk_upload: "बल्क अपलोड", class_report: "कक्षा रिपोर्ट",
    school_dashboard: "स्कूल डैशबोर्ड", admin: "एडमिन", questions: "प्रश्न",
    results: "परिणाम",
    start_assessment: "मूल्यांकन शुरू करें", retake_assessment: "फिर से लें",
    hi_greeting: "नमस्ते", class_: "कक्षा", board: "बोर्ड", school: "स्कूल",
    take_assessment_title: "अपना करियर मूल्यांकन लें",
    retake_title: "अपना मूल्यांकन फिर से लें",
    past_reports: "पिछली रिपोर्टें", your_history: "आपका इतिहास",
    no_assessments: "अभी कोई मूल्यांकन नहीं। ऊपर से शुरू करें!",
    what_youll_get: "आपको क्या मिलेगा (NEP-अनुकूल)",
    save_pdf: "PDF सेव करें",
    top_careers: "आपके लिए उपयुक्त करियर",
    ai_career_report: "AI करियर रिपोर्ट",
    explore_career: "करियर देखें",
    print_report: "प्रिंट / PDF",
    recommended_stream: "अनुशंसित स्ट्रीम",
    language: "भाषा",
  },
  pa: {
    login: "ਲੌਗਇਨ", get_started: "ਸ਼ੁਰੂ ਕਰੋ", logout: "ਲੌਗਆਊਟ",
    dashboard: "ਡੈਸ਼ਬੋਰਡ", assessment: "ਮੁਲਾਂਕਣ", vocational: "ਵੋਕੇਸ਼ਨਲ",
    my_children: "ਮੇਰੇ ਬੱਚੇ", school_overview: "ਸਕੂਲ ਸੰਖੇਪ",
    students: "ਵਿਦਿਆਰਥੀ", bulk_upload: "ਬਲਕ ਅੱਪਲੋਡ", class_report: "ਕਲਾਸ ਰਿਪੋਰਟ",
    school_dashboard: "ਸਕੂਲ ਡੈਸ਼ਬੋਰਡ", admin: "ਐਡਮਿਨ", questions: "ਪ੍ਰਸ਼ਨ",
    results: "ਨਤੀਜੇ",
    start_assessment: "ਮੁਲਾਂਕਣ ਸ਼ੁਰੂ ਕਰੋ", retake_assessment: "ਦੁਬਾਰਾ ਲਵੋ",
    hi_greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", class_: "ਜਮਾਤ", board: "ਬੋਰਡ", school: "ਸਕੂਲ",
    take_assessment_title: "ਆਪਣਾ ਕੈਰੀਅਰ ਮੁਲਾਂਕਣ ਲਵੋ",
    retake_title: "ਆਪਣਾ ਮੁਲਾਂਕਣ ਦੁਬਾਰਾ ਲਵੋ",
    past_reports: "ਪੁਰਾਣੀਆਂ ਰਿਪੋਰਟਾਂ", your_history: "ਤੁਹਾਡਾ ਇਤਿਹਾਸ",
    no_assessments: "ਹਾਲੇ ਕੋਈ ਮੁਲਾਂਕਣ ਨਹੀਂ। ਉੱਪਰੋਂ ਸ਼ੁਰੂ ਕਰੋ!",
    what_youll_get: "ਤੁਹਾਨੂੰ ਕੀ ਮਿਲੇਗਾ (NEP-ਅਨੁਕੂਲ)",
    save_pdf: "PDF ਸੇਵ ਕਰੋ",
    top_careers: "ਤੁਹਾਡੇ ਲਈ ਢੁਕਵੇਂ ਕੈਰੀਅਰ",
    ai_career_report: "AI ਕੈਰੀਅਰ ਰਿਪੋਰਟ",
    explore_career: "ਕੈਰੀਅਰ ਵੇਖੋ",
    print_report: "ਪ੍ਰਿੰਟ / PDF",
    recommended_stream: "ਸਿਫਾਰਸ਼ੀ ਸਟ੍ਰੀਮ",
    language: "ਭਾਸ਼ਾ",
  },
};

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("pf_lang") || "en");

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (c) => {
    localStorage.setItem("pf_lang", c);
    setLangState(c);
  };

  const t = (key) => STRINGS[lang]?.[key] || STRINGS.en[key] || key;

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
