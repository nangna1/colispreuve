"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";

type Result = { id: string } | { error: string };

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

  const { data, error } = await supabase
    .from("expeditions")
    .insert({
      entreprise_id: profile.entreprise_id,
      destinataire_nom: destinataireNom,
      destinataire_telephone: input.destinataireTelephone?.trim() || null,
      adresse_enlevement: adresseEnlevement,
      adresse_livraison: adresseLivraison,
      description_marchandise: input.descriptionMarchandise?.trim() || null,
      quantite_declaree: input.quantiteDeclaree ?? null,
      chauffeur_id: input.chauffeurId || null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

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
