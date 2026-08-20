"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type TrackingPreuve = {
  type: "enlevement" | "livraison";
  photoUrl: string;
  createdAt: string;
};

export type TrackingInfo = {
  destinataireNom: string;
  statut: string;
  adresseLivraison: string;
  createdAt: string;
  preuves: TrackingPreuve[];
} | { error: string };

// Portail public de suivi (/suivi/[token]) : le destinataire n'a jamais de
// compte, donc pas de session à vérifier — l'accès est protégé par la
// possession du token (uuid opaque, voir expeditions.token_public dans la
// migration 0001). Volontairement PAS de policy RLS ouverte à `anon` sur
// `expeditions`/`preuves` : cette Server Action utilise le client
// service_role et ne renvoie que les champs utiles au destinataire, jamais
// l'entreprise_id, le chauffeur assigné, la quantité déclarée/constatée ou
// la signature (qui ne le regardent pas).
export async function getExpeditionByToken(token: string): Promise<TrackingInfo> {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return { error: "Lien de suivi invalide." };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("expeditions")
    .select("id, destinataire_nom, statut, adresse_livraison, created_at")
    .eq("token_public", token)
    .single();

  if (error || !data) return { error: "Expédition introuvable." };

  const { data: preuves, error: preuvesErr } = await admin
    .from("preuves")
    .select("type, photo_url, created_at")
    .eq("expedition_id", data.id)
    .order("created_at", { ascending: true });
  if (preuvesErr) return { error: preuvesErr.message };

  return {
    destinataireNom: data.destinataire_nom,
    statut: data.statut,
    adresseLivraison: data.adresse_livraison,
    createdAt: data.created_at,
    preuves: preuves.map((p) => ({ type: p.type, photoUrl: p.photo_url, createdAt: p.created_at })),
  };
}
