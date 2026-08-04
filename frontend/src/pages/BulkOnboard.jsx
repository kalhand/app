import { useState } from "react";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { BOARDS } from "@/lib/nep";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, Loader2, Copy, Download } from "lucide-react";

// CSV columns: name,email,grade,education_board,password(optional)
const SAMPLE = `name,email,grade,education_board,password
Riya Kapoor,riya@example.com,10,CBSE,
Arjun Mehta,arjun@example.com,11,ICSE,Welcome@2026
Sara Khan,sara@example.com,9,PSEB,`;

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = cells[i] || ""; });
    return {
      name: row.name || "",
      email: row.email || "",
      grade: row.grade || undefined,
      education_board: row.education_board || undefined,
      password: row.password || undefined,
    };
  }).filter((r) => r.name && r.email);
}

export default function BulkOnboard() {
  const { user } = useAuth();
  const [text, setText] = useState(SAMPLE);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const rows = parseCsv(text);
    if (rows.length === 0) {
      toast.error("No valid rows found in CSV");
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const invalid = rows.filter((r) => r.education_board && !BOARDS.includes(r.education_board));
      if (invalid.length) {
        toast.error(`Invalid boards for ${invalid.length} row(s). Allowed: ${BOARDS.join(", ")}`);
        setBusy(false);
        return;
      }
      const { data } = await api.post("/principal/students/bulk", { students: rows });
      setResult(data);
      toast.success(`${data.summary.created} created, ${data.summary.skipped} skipped, ${data.summary.errors} errors`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Bulk upload failed");
    } finally {
      setBusy(false);
    }
  };

  const copyCreds = () => {
    if (!result?.created?.length) return;
    const csv = "email,temp_password\n" +
      result.created.map((c) => `${c.email},${c.temp_password}`).join("\n");
    navigator.clipboard.writeText(csv);
    toast.success("Credentials copied to clipboard");
  };

  const downloadCreds = () => {
    if (!result?.created?.length) return;
    const csv = "name,email,temp_password\n" +
      result.created.map((c) => `${c.name},${c.email},${c.temp_password}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "pathfinder-students-credentials.csv";
    link.click();
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
        <span className="label-mono">{user?.role === "principal" ? "Principal" : user?.role === "counselor" ? "Counselor" : "Admin"} · Bulk onboarding</span>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">
          Onboard a full class
        </h1>
        <p className="text-[#52525B] mt-2 max-w-2xl">
          Paste a CSV of students below. School is auto-set to <b>{user?.school_name || "your school"}</b>.
          Empty <code>password</code> cells auto-generate a temp password.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3 card-brutal p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileSpreadsheet size={18} strokeWidth={2.5} />
              <span className="label-mono">CSV input</span>
            </div>
            <textarea
              data-testid="bulk-csv-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={14}
              className="w-full font-mono text-xs px-3 py-3 border-2 border-[#0A0A0A] rounded-xl bg-[#FAFAF9] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={submit}
              disabled={busy}
              data-testid="bulk-submit-btn"
              className="btn-brutal bg-blue-600 text-white w-full py-3 mt-4 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {busy ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} strokeWidth={2.5} />}
              Create students
            </button>
          </div>

          <div className="md:col-span-2 card-brutal p-5 bg-[#FEF08A]">
            <span className="label-mono">Format</span>
            <ol className="text-sm mt-3 space-y-2 list-decimal ml-4">
              <li>First row is the header (as shown).</li>
              <li>Columns: <b>name, email, grade, education_board, password</b></li>
              <li>Allowed boards: {BOARDS.join(", ")}.</li>
              <li>Existing emails are safely skipped.</li>
              <li>Save generated passwords right after upload!</li>
            </ol>
          </div>
        </div>

        {result && (
          <div className="mt-8 card-brutal p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-3">
                <span className="text-xs px-3 py-1 rounded-full border-2 border-[#0A0A0A] bg-[#A7F3D0]">Created: {result.summary.created}</span>
                <span className="text-xs px-3 py-1 rounded-full border-2 border-[#0A0A0A] bg-[#FEF08A]">Skipped: {result.summary.skipped}</span>
                <span className="text-xs px-3 py-1 rounded-full border-2 border-[#0A0A0A] bg-[#FFDDBF]">Errors: {result.summary.errors}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={copyCreds} className="btn-brutal bg-white text-sm px-3 py-1.5 flex items-center gap-1"><Copy size={14} strokeWidth={2.5} /> Copy</button>
                <button onClick={downloadCreds} className="btn-brutal bg-[#0A0A0A] text-white text-sm px-3 py-1.5 flex items-center gap-1"><Download size={14} strokeWidth={2.5} /> Download</button>
              </div>
            </div>

            {result.created.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#FAFAF9] border-b-2 border-[#0A0A0A]">
                    <tr>
                      <th className="text-left px-3 py-2 label-mono">Name</th>
                      <th className="text-left px-3 py-2 label-mono">Email</th>
                      <th className="text-left px-3 py-2 label-mono">Temp password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.created.map((c, i) => (
                      <tr key={i} data-testid={`bulk-created-${i}`} className="border-b border-[#0A0A0A]/10">
                        <td className="px-3 py-2">{c.name}</td>
                        <td className="px-3 py-2 text-[#52525B]">{c.email}</td>
                        <td className="px-3 py-2 font-mono text-xs">{c.temp_password}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {result.skipped.length > 0 && (
              <div className="mt-4 text-xs text-[#52525B]">
                <span className="label-mono">Skipped ({result.skipped.length})</span>
                <ul className="mt-1">{result.skipped.map((s, i) => <li key={i}>• {s.email} — {s.reason}</li>)}</ul>
              </div>
            )}
            {result.errors.length > 0 && (
              <div className="mt-4 text-xs text-red-700">
                <span className="label-mono">Errors ({result.errors.length})</span>
                <ul className="mt-1">{result.errors.map((s, i) => <li key={i}>• {s.email} — {s.reason}</li>)}</ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
