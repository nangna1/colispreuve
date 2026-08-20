import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getExpedition, STATUT_LABEL } from "@/lib/data/expeditions";
import PreuveForm from "./preuve-form";

export default async function ChauffeurExpeditionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const expedition = await getExpedition(supabase, id);
  if (!expedition) notFound();

  const enAttenteEnlevement = expedition.statut === "cree";
  const enAttenteLivraison = expedition.statut === "enleve" || expedition.statut === "en_transit";
  const terminee = expedition.statut === "livre" || expedition.statut === "litige";

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-[10.5px] uppercase tracking-[0.1em] text-ink-faint">Destinataire</div>
        <div className="mt-1 font-semibold text-ink">{expedition.destinataire_nom}</div>
        {expedition.destinataire_telephone && (
          <div className="text-sm text-ink-muted">{expedition.destinataire_telephone}</div>
        )}
        <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
          <div>
            <span className="text-ink-faint">Enlèvement : </span>
            <span className="text-ink-soft">{expedition.adresse_enlevement}</span>
          </div>
          <div>
            <span className="text-ink-faint">Livraison : </span>
            <span className="text-ink-soft">{expedition.adresse_livraison}</span>
          </div>
          {expedition.description_marchandise && (
            <div>
              <span className="text-ink-faint">Marchandise : </span>
              <span className="text-ink-soft">{expedition.description_marchandise}</span>
            </div>
          )}
          {expedition.quantite_declaree != null && (
            <div>
              <span className="text-ink-faint">Quantité déclarée : </span>
              <span className="text-ink-soft">{expedition.quantite_declaree}</span>
            </div>
          )}
        </div>
      </div>

      {enAttenteEnlevement && (
        <div>
          <div className="mb-2 text-sm font-semibold text-navy-deep">Enlèvement</div>
          <PreuveForm expeditionId={expedition.id} type="enlevement" />
        </div>
      )}

      {enAttenteLivraison && (
        <div>
          <div className="mb-2 text-sm font-semibold text-navy-deep">Livraison</div>
          <PreuveForm expeditionId={expedition.id} type="livraison" />
        </div>
      )}

      {terminee && (
        <div className="rounded-xl border border-dashed border-border-input bg-card p-4 text-center text-sm text-ink-muted">
          Expédition {STATUT_LABEL[expedition.statut].toLowerCase()}.
        </div>
      )}
    </div>
  );
}
