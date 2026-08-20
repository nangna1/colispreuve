"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignChauffeur } from "@/app/actions/expeditions";
import type { Chauffeur } from "@/lib/data/expeditions";

export default function AssignChauffeur({
  expeditionId,
  chauffeurs,
  chauffeurActuelId,
}: {
  expeditionId: string;
  chauffeurs: Chauffeur[];
  chauffeurActuelId: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(chauffeurActuelId ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(next: string) {
    setValue(next);
    if (!next) return;
    setLoading(true);
    setError(null);
    const res = await assignChauffeur(expeditionId, next);
    setLoading(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className="rounded-lg border border-border-input bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-navy"
      >
        <option value="">— Non assigné —</option>
        {chauffeurs.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nom}
          </option>
        ))}
      </select>
      {error && <div className="text-xs text-rouge">{error}</div>}
    </div>
  );
}
