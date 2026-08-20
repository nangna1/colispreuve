"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDriverAccess } from "@/app/actions/driver-access";
import type { Chauffeur } from "@/lib/data/expeditions";

export default function ChauffeursList({ chauffeurs }: { chauffeurs: Chauffeur[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ code: string; nom: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await createDriverAccess({ nom, telephone: telephone || undefined });
    setLoading(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    setResult({ code: res.code, nom });
    setNom("");
    setTelephone("");
    router.refresh();
  }

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {chauffeurs.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-ink-faint">Aucun chauffeur pour l&apos;instant.</div>
        ) : (
          chauffeurs.map((c) => (
            <div key={c.id} className="flex items-center justify-between border-b border-[#EAE2CF] px-5 py-3.5 text-[13.5px] last:border-b-0">
              <span className="font-semibold text-ink">{c.nom}</span>
              <span className="text-ink-muted">{c.telephone ?? "—"}</span>
            </div>
          ))
        )}
      </div>

      {result && (
        <div className="rounded-[11px] border border-dashed border-navy bg-navy-tint p-3.5 text-[13px]">
          <div className="text-[11px] text-ink-muted">
            Accès créé pour {result.nom} — code affiché une seule fois, à transmettre par WhatsApp ou oralement
          </div>
          <div dir="ltr" className="mt-1.5 text-lg font-semibold tracking-[0.1em] text-ink">
            {result.code}
          </div>
          <button type="button" onClick={() => setResult(null)} className="mt-2 text-xs font-semibold text-navy hover:underline">
            Fermer
          </button>
        </div>
      )}

      {!open && !result && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-border-input bg-card py-3 text-[13.5px] font-semibold text-ink-soft hover:bg-card-alt"
        >
          + Ajouter un chauffeur
        </button>
      )}

      {open && (
        <form onSubmit={submit} className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-5">
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom complet *"
            required
            className="rounded-lg border border-border-input bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-navy"
          />
          <input
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="Téléphone (ex. 07 48 12 90)"
            className="rounded-lg border border-border-input bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-navy"
          />
          {error && <div className="text-xs text-rouge">{error}</div>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-navy py-2.5 text-[13px] font-semibold text-white hover:bg-navy-dark disabled:opacity-60"
            >
              {loading ? "Création…" : "Créer l'accès"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-border-input px-3 text-[13px] text-ink-muted">
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
