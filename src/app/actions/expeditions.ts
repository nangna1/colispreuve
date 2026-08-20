"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";
import { getEntreprise } from "@/lib/data/entreprises";
import { consoleMessagingProvider } from "@/lib/providers/messaging-provider";

type Result = { id: string } | { error: string };

function lienSuiviAbsolu(tokenPublic: string): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/suivi/${tokenPublic}`;
}

// Envoie (ou réenvoie) au destinataire le lien de suivi de son colis. Ne
// bloque jamais la création/la fiche de l'expédition si l'envoi échoue —
// le lien reste consultable manuellement depuis la fiche dans tous les cas
// (voir /expediteur/expeditions/[id]) — juste une notification de confort,
// pas le mécanisme d'accès lui-même.
async function envoyerLienSuivi(
  entrepriseId: string,
  destinataireNom: string,
  destinataireTelephone: string | null,
  tokenPublic: string,
): Promise<void> {
  if (!destinataireTelephone) return;

  const supabase = await createClient();
  const entreprise = await getEntreprise(supabase, entrepriseId);
  const nomEntreprise = entreprise?.nom ?? "Votre expéditeur";

  await consoleMessagingProvider.send({
    toPhone: destinataireTelephone,
    body: `Bonjour ${destinataireNom}, ${nomEntreprise} a enregistré votre colis. Suivez sa livraison ici : ${lienSuiviAbsolu(tokenPublic)}`,
  });
}

export async function createExpedition(input: {
  destinataireNom: string;
  destinataireTelephone?: string;
  adresseEnlevement: string;
  adresseLivraison: string;
  descriptionMarchandise?: string;
  quantiteDeclaree?: number;
  chauffeurId?: string;
}): Promise<Result> {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile || profile.role !== "expediteur") return { error: "Non autorisé." };

  const destinataireNom = input.destinataireNom.trim();
  const adresseEnlevement = input.adresseEnlevement.trim();
  const adresseLivraison = input.adresseLivraison.trim();
  if (!destinataireNom || !adresseEnlevement || !adresseLivraison) {
    return { error: "Destinataire et adresses requis." };
  }

  const destinataireTelephone = input.destinataireTelephone?.trim() || null;

  const { data, error } = await supabase
    .from("expeditions")
    .insert({
      entreprise_id: profile.entreprise_id,
      destinataire_nom: destinataireNom,
      destinataire_telephone: destinataireTelephone,
      adresse_enlevement: adresseEnlevement,
      adresse_livraison: adresseLivraison,
      description_marchandise: input.descriptionMarchandise?.trim() || null,
      quantite_declaree: input.quantiteDeclaree ?? null,
      chauffeur_id: input.chauffeurId || null,
    })
    .select("id, token_public")
    .single();
  if (error) return { error: error.message };

  await envoyerLienSuivi(profile.entreprise_id, destinataireNom, destinataireTelephone, data.token_public).catch(
    (err) => console.error("envoyerLienSuivi (création)", err),
  );

  revalidatePath("/expediteur");
  return { id: data.id };
}

export async function assignChauffeur(expeditionId: string, chauffeurId: string): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile || profile.role !== "expediteur") return { error: "Non autorisé." };

  const { error } = await supabase
    .from("expeditions")
    .update({ chauffeur_id: chauffeurId })
    .eq("id", expeditionId);
  if (error) return { error: error.message };

  revalidatePath(`/expediteur/expeditions/${expeditionId}`);
  return { ok: true };
}

export async function renvoyerLienSuivi(expeditionId: string): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile || profile.role !== "expediteur") return { error: "Non autorisé." };

  const { data: expedition, error } = await supabase
    .from("expeditions")
    .select("destinataire_nom, destinataire_telephone, token_public")
    .eq("id", expeditionId)
    .single();
  if (error || !expedition) return { error: error?.message ?? "Expédition introuvable." };
  if (!expedition.destinataire_telephone) return { error: "Aucun téléphone destinataire enregistré." };

  await envoyerLienSuivi(
    profile.entreprise_id,
    expedition.destinataire_nom,
    expedition.destinataire_telephone,
    expedition.token_public,
  );

  return { ok: true };
}
