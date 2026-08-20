import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type Incident = Database["public"]["Tables"]["incidents"]["Row"];

export async function getIncidentsForExpedition(
  supabase: SupabaseClient<Database>,
  expeditionId: string,
): Promise<Incident[]> {
  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .eq("expedition_id", expeditionId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
