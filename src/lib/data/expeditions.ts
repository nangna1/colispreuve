import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type Expedition = Database["public"]["Tables"]["expeditions"]["Row"];
export type Preuve = Database["public"]["Tables"]["preuves"]["Row"];
export type Chauffeur = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "nom" | "telephone"
>;

export const STATUT_LABEL: Record<Expedition["statut"], string> = {
  cree: "Créée",
  enleve: "Enlevée",
  en_transit: "En transit",
  livre: "Livrée",
  litige: "Litige",
};

export async function getExpeditions(supabase: SupabaseClient<Database>): Promise<Expedition[]> {
  const { data, error } = await supabase
    .from("expeditions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getExpedition(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<Expedition | null> {
  const { data, error } = await supabase.from("expeditions").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPreuvesForExpedition(
  supabase: SupabaseClient<Database>,
  expeditionId: string,
): Promise<Preuve[]> {
  const { data, error } = await supabase
    .from("preuves")
    .select("*")
    .eq("expedition_id", expeditionId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

// Chauffeurs de la propre entreprise de l'appelant — RLS
// profiles_entreprise_read (0001_init.sql) limite déjà le résultat aux
// chauffeurs de son entreprise, inutile de re-filtrer ici.
export async function getChauffeurs(supabase: SupabaseClient<Database>): Promise<Chauffeur[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nom, telephone")
    .eq("role", "chauffeur")
    .order("nom");
  if (error) throw error;
  return data;
}
