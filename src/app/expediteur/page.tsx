import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getExpeditions, STATUT_LABEL, type Expedition } from "@/lib/data/expeditions";

const STATUT_STYLE: Record<Expedition["statut"], { bg: string; fg: string }> = {
  cree: { bg: "var(--color-paper-sunk)", fg: "var(--color-ink-muted)" },
  enleve: { bg: "var(--color-navy-tint)", fg: "var(--color-navy)" },
  en_transit: { bg: "#FBEFD6", fg: "#8A6218" },
  livre: { bg: "#E4F3E8", fg: "#1F7A45" },
  litige: { bg: "var(--color-rouge-tint)", fg: "var(--color-rouge)" },
};

export default async function ExpediteurDashboardPage() {
  const supabase = await createClient();
  const expeditions = await getExpeditions(supabase);

  return (
    <div className="flex flex-col">
      <div className="flex items-end justify-between gap-6 border-b border-border bg-card px-[34px] pb-[18px] pt-6">
        <div className="flex flex-col gap-1">
          <div className="text-[27px] font-bold tracking-tight text-navy-deep">Expéditions</div>
          <div className="text-[13px] text-ink-muted">
            {expeditions.length} expédition{expeditions.length > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="px-[34px] py-[26px]">
        {expeditions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-input bg-card p-10 text-center text-sm text-ink-faint">
            Aucune expédition pour l&apos;instant.{" "}
            <Link href="/expediteur/nouvelle" className="font-semibold text-navy hover:underline">
              Créer la première
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid grid-cols-[1.6fr_1.4fr_1fr_0.9fr] gap-3 border-b border-border bg-card-alt px-5 py-3.5 text-[11px] uppercase tracking-[0.1em] text-ink-faint">
              <span>Destinataire</span>
              <span>Livraison</span>
              <span>Statut</span>
              <span>Créée le</span>
            </div>
            {expeditions.map((e) => {
              const status = STATUT_STYLE[e.statut];
              return (
                <Link
                  key={e.id}
                  href={`/expediteur/expeditions/${e.id}`}
                  className="grid grid-cols-[1.6fr_1.4fr_1fr_0.9fr] items-center gap-3 border-b border-[#EAE2CF] px-5 py-3.5 text-[13.5px] last:border-b-0 hover:bg-[#F2EFE5]"
                >
                  <span className="font-semibold text-ink">{e.destinataire_nom}</span>
                  <span className="text-ink-soft">{e.adresse_livraison}</span>
                  <span
                    className="justify-self-start rounded-full px-2.5 py-1 text-[11.5px]"
                    style={{ background: status.bg, color: status.fg }}
                  >
                    {STATUT_LABEL[e.statut]}
                  </span>
                  <span className="text-[12.5px] text-ink-muted">
                    {new Date(e.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
