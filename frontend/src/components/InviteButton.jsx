import { useState } from "react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { Ticket, Copy, Loader2 } from "lucide-react";

// Reusable invite generator button + link display.
// endpoint: "/admin/invites" or "/principal/invites"
// role: "university" | "counselor"
export default function InviteButton({ endpoint, role, label, testId = "invite-btn" }) {
  const [busy, setBusy] = useState(false);
  const [invite, setInvite] = useState(null);
  const base = `${window.location.origin}/invite/`;

  const create = async () => {
    setBusy(true);
    try {
      const { data } = await api.post(endpoint, { role });
      setInvite(data);
      toast.success("Invite generated");
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Could not create invite");
    } finally { setBusy(false); }
  };

  const copy = () => {
    navigator.clipboard.writeText(`${base}${invite.code}`);
    toast.success("Invite link copied");
  };

  return (
    <div>
      {!invite ? (
        <button onClick={create} disabled={busy} data-testid={testId}
          className="btn-brutal bg-blue-600 text-white px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-60">
          {busy ? <Loader2 className="animate-spin" size={14} /> : <Ticket size={14} strokeWidth={2.5} />} {label}
        </button>
      ) : (
        <div className="card-brutal p-4 bg-[#FEF08A]">
          <div className="label-mono">One-tap invite link — share via WhatsApp / email</div>
          <div data-testid="invite-link-display" className="font-mono text-xs mt-2 break-all">{base}{invite.code}</div>
          <div className="mt-3 flex items-center gap-2">
            <button onClick={copy} className="btn-brutal bg-white px-3 py-1.5 text-xs flex items-center gap-1"><Copy size={12} strokeWidth={2.5} /> Copy</button>
            <button onClick={() => setInvite(null)} className="text-xs underline">Generate another</button>
            <span className="label-mono ml-auto">Expires {new Date(invite.expires_at).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
