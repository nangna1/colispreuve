import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";
import { getExpedition, getPreuvesForExpedition } from "@/lib/data/expeditions";
import { getIncidentsForExpedition } from "@/lib/data/incidents";
import { getEntreprise } from "@/lib/data/entreprises";
import { buildLettreReclamation } from "@/lib/data/lettre-reclamation";
import PrintTrigger from "./print-trigger";

export default async function LettreReclamationPage({
  params,
}: {
  params: Promise<{ id: string; incidentId: string }>;
}) {
  const { id, incidentId } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile || profile.role !== "expediteur") redirect("/login");

  const expedition = await getExpedition(supabase, id);
  if (!expedition) notFound();

  const [incidents, preuves, entreprise] = await Promise.all([
    getIncidentsForExpedition(supabase, id),
    getPreuvesForExpedition(supabase, id),
    getEntreprise(supabase, profile.entreprise_id),
  ]);
  const incident = incidents.find((i) => i.id === incidentId);
  if (!incident || !entreprise) notFound();

  const preuveLivraison = preuves.find((p) => p.type === "livraison") ?? null;
  const lienSuivi =
    (process.env.NEXT_PUBLIC_SITE_URL ?? "") + `/suivi/${expedition.token_public}`;
  const lettre = buildLettreReclamation(entreprise, expedition, incident, preuveLivraison, lienSuivi);
  const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-[800px] p-10 font-sans text-ink print:p-0">
      <PrintTrigger />

      <div className="mb-8 flex items-baseline justify-between border-b border-border pb-4">
        <div>
          <div className="text-lg font-semibold">{entreprise.nom}</div>
          {entreprise.telephone && <div className="text-sm text-ink-muted">{entreprise.telephone}</div>}
        </div>
        <div className="text-sm text-ink-muted">{today}</div>
      </div>

      <div className="mb-8 text-sm text-ink-muted">
        À l&apos;attention de : {expedition.destinataire_nom}
        {expedition.destinataire_telephone && ` — ${expedition.destinataire_telephone}`}
      </div>

      <div className="mb-6 text-sm font-bold uppercase tracking-wide">OBJET : {lettre.objet}</div>

      <div className="flex flex-col gap-4 text-[15px] leading-relaxed">
        {lettre.paragraphes.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="mt-10 text-sm">
        <div>Salutations distinguées,</div>
        <div className="mt-6 font-semibold">{profile.nom}</div>
        <div>{entreprise.nom}</div>
        {entreprise.telephone && <div>{entreprise.telephone}</div>}
      </div>
    </div>
  );
}
