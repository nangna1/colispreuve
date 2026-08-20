import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getExpedition, getPreuvesForExpedition, getChauffeurs, STATUT_LABEL } from "@/lib/data/expeditions";
import AssignChauffeur from "./assign-chauffeur";

export default async function ExpeditionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const expedition = await getExpedition(supabase, id);
  if (!expedition) notFound();

  const [preuves, chauffeurs] = await Promise.all([
    getPreuvesForExpedition(supabase, id),
    getChauffeurs(supabase),
  ]);
  const chauffeurAssigne = chauffeurs.find((c) => c.id === expedition.chauffeur_id);
  const lienSuivi = `/suivi/${expedition.token_public}`;

  return (
    <div className="flex flex-col">
      <div className="flex items-end justify-between gap-6 border-b border-border bg-card px-[34px] pb-[18px] pt-6">
        <div className="flex flex-col gap-1">
          <div className="text-[27px] font-bold tracking-tight text-navy-deep">{expedition.destinataire_nom}</div>
          <div className="text-[13px] text-ink-muted">{STATUT_LABEL[expedition.statut]}</div>
        </div>
      </div>

      <div className="flex max-w-2xl flex-col gap-5 px-[34px] py-[26px]">
        <div className="grid grid-cols-2 gap-3">
          <Info k="Adresse d'enlèvement" v={expedition.adresse_enlevement} />
          <Info k="Adresse de livraison" v={expedition.adresse_livraison} />
          <Info k="Marchandise" v={expedition.description_marchandise ?? "—"} />
          <Info k="Quantité déclarée" v={expedition.quantite_declaree?.toString() ?? "—"} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">Chauffeur</div>
          <AssignChauffeur expeditionId={expedition.id} chauffeurs={chauffeurs} chauffeurActuelId={expedition.chauffeur_id} />
          {chauffeurAssigne && <div className="mt-2 text-sm text-ink-soft">{chauffeurAssigne.telephone ?? ""}</div>}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">Lien de suivi public</div>
          <a href={lienSuivi} target="_blank" rel="noreferrer" className="text-sm text-navy hover:underline">
            {lienSuivi}
          </a>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
            Preuves ({preuves.length})
          </div>
          {preuves.length === 0 ? (
            <div className="text-sm text-ink-faint">
              Aucune preuve pour l&apos;instant — s&apos;affichera ici une fois l&apos;enlèvement/la livraison
              enregistrés par le chauffeur.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {preuves.map((p) => (
                <div key={p.id} className="rounded-lg border border-border-soft p-3">
                  <div className="text-xs font-semibold text-ink">{p.type === "enlevement" ? "Enlèvement" : "Livraison"}</div>
                  <div className="text-[11px] text-ink-faint">{new Date(p.created_at).toLocaleString("fr-FR")}</div>
                  {/* eslint-disable-next-line @next/next/no-img-element -- image distante Supabase Storage */}
                  <img src={p.photo_url} alt="Preuve" className="mt-2 w-full rounded" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-border-soft bg-card p-3.5">
      <div className="text-[10.5px] uppercase tracking-[0.1em] text-ink-faint">{k}</div>
      <div className="mt-1.5 text-sm font-semibold text-ink">{v}</div>
    </div>
  );
}
