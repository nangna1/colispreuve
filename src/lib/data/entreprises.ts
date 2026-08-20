import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type Entreprise = Database["public"]["Tables"]["entreprises"]["Row"];

export async function getEntreprise(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<Entreprise | null> {
  const { data, error } = await supabase.from("entreprises").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}
