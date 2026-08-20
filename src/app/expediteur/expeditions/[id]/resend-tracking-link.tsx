"use client";

import { useState } from "react";
import { renvoyerLienSuivi } from "@/app/actions/expeditions";

export default function ResendTrackingLink({ expeditionId }: { expeditionId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function resend() {
    setLoading(true);
    setMessage(null);
    const res = await renvoyerLienSuivi(expeditionId);
    setLoading(false);
    setMessage("error" in res ? res.error : "Lien renvoyé au destinataire.");
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <button type="button" onClick={resend} disabled={loading} className="text-xs font-semibold text-navy hover:underline disabled:opacity-50">
        {loading ? "Envoi…" : "Renvoyer le lien au destinataire"}
      </button>
      {message && <span className="text-xs text-ink-muted">{message}</span>}
    </div>
  );
}
