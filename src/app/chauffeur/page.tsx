import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMesExpeditions, STATUT_LABEL, type Expedition } from "@/lib/data/expeditions";

const STATUT_STYLE: Record<Expedition["statut"], { bg: string; fg: string }> = {
  cree: { bg: "var(--color-paper-sunk)", fg: "var(--color-ink-muted)" },
  enleve: { bg: "var(--color-navy-tint)", fg: "var(--color-navy)" },
  en_transit: { bg: "#FBEFD6", fg: "#8A6218" },
  livre: { bg: "#E4F3E8", fg: "#1F7A45" },
  litige: { bg: "var(--color-rouge-tint)", fg: "var(--color-rouge)" },
};

const ACTION_LABEL: Partial<Record<Expedition["statut"], string>> = {
  cree: "Enlever",
  enleve: "Livrer",
  en_transit: "Livrer",
};

export default async function ChauffeurPage() {
  const supabase = await createClient();
  const expeditions = await getMesExpeditions(supabase);
  const enCours = expeditions.filter((e) => e.statut === "cree" || e.statut === "enleve" || e.statut === "en_transit");
  const terminees = expeditions.filter((e) => e.statut === "livre" || e.statut === "litige");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
          Mes courses ({enCours.length})
        </div>
        {enCours.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-input bg-card p-6 text-center text-sm text-ink-faint">
            Aucune course en attente.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {enCours.map((e) => {
              const status = STATUT_STYLE[e.statut];
              return (
                <Link
                  key={e.id}
                  href={`/chauffeur/expeditions/${e.id}`}
                  className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-ink">{e.destinataire_nom}</span>
                    <span className="rounded-full px-2.5 py-1 text-[11px]" style={{ background: status.bg, color: status.fg }}>
                      {STATUT_LABEL[e.statut]}
                    </span>
                  </div>
                  <div className="text-[12.5px] text-ink-muted">
                    {e.statut === "cree" ? e.adresse_enlevement : e.adresse_livraison}
                  </div>
                  {ACTION_LABEL[e.statut] && (
                    <span className="mt-1 text-[12.5px] font-semibold text-navy">
                      → {ACTION_LABEL[e.statut]}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {terminees.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
            Terminées ({terminees.length})
          </div>
          <div className="flex flex-col gap-2">
            {terminees.map((e) => {
              const status = STATUT_STYLE[e.statut];
              return (
                <Link
                  key={e.id}
                  href={`/chauffeur/expeditions/${e.id}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border-soft bg-card-alt px-4 py-3"
                >
                  <span className="text-sm text-ink-soft">{e.destinataire_nom}</span>
                  <span className="rounded-full px-2.5 py-1 text-[11px]" style={{ background: status.bg, color: status.fg }}>
                    {STATUT_LABEL[e.statut]}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
