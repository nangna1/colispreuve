import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Preuve = Database["public"]["Tables"]["preuves"]["Row"];

async function uploadPhoto(
  supabase: SupabaseClient<Database>,
  expeditionId: string,
  fileName: string,
  blob: Blob,
): Promise<string> {
  const path = `${expeditionId}/${fileName}`;
  const { error } = await supabase.storage.from("preuves").upload(path, blob, {
    contentType: blob.type || "image/jpeg",
    upsert: true,
  });
  if (error) throw error;
  return supabase.storage.from("preuves").getPublicUrl(path).data.publicUrl;
}

// Enregistre la preuve d'enlèvement : upload de la photo, insertion de la
// ligne `preuves`, passage de l'expédition au statut 'enleve'. Appelée à la
// fois par l'écran Enlèvement (tentative directe) et par flushQueue lors de
// la synchronisation d'une action mise en file hors-ligne — même fonction
// dans les deux cas, voir lib/offline/sync.ts.
export async function enregistrerPreuveEnlevement(
  supabase: SupabaseClient<Database>,
  input: {
    expeditionId: string;
    photo: Blob;
    latitude: number | null;
    longitude: number | null;
    quantiteConstatee: number | null;
    commentaire: string | null;
  },
): Promise<Preuve> {
  const photoUrl = await uploadPhoto(supabase, input.expeditionId, `enlevement-${Date.now()}.jpg`, input.photo);

  const { data, error } = await supabase
    .from("preuves")
    .insert({
      expedition_id: input.expeditionId,
      type: "enlevement",
      photo_url: photoUrl,
      latitude: input.latitude,
      longitude: input.longitude,
      quantite_constatee: input.quantiteConstatee,
      commentaire: input.commentaire,
    })
    .select()
    .single();
  if (error) throw error;

  const { error: updateErr } = await supabase
    .from("expeditions")
    .update({ statut: "enleve" })
    .eq("id", input.expeditionId);
  if (updateErr) throw updateErr;

  return data;
}

// Enregistre la preuve de livraison : upload photo (+ signature si prise),
// insertion de la ligne `preuves`, détection d'écart de quantité (compare à
// expeditions.quantite_declaree — si différent, ouvre un incident et passe
// l'expédition en 'litige' plutôt que 'livre'). C'est ici que la valeur du
// produit se joue : la preuve doit exister AVANT que le litige ne soit
// discuté, pas reconstituée après coup.
export async function enregistrerPreuveLivraison(
  supabase: SupabaseClient<Database>,
  input: {
    expeditionId: string;
    photo: Blob;
    signature: Blob | null;
    latitude: number | null;
    longitude: number | null;
    quantiteConstatee: number | null;
    commentaire: string | null;
  },
): Promise<Preuve> {
  const photoUrl = await uploadPhoto(supabase, input.expeditionId, `livraison-${Date.now()}.jpg`, input.photo);
  const signatureUrl = input.signature
    ? await uploadPhoto(supabase, input.expeditionId, `signature-${Date.now()}.png`, input.signature)
    : null;

  const { data, error } = await supabase
    .from("preuves")
    .insert({
      expedition_id: input.expeditionId,
      type: "livraison",
      photo_url: photoUrl,
      signature_url: signatureUrl,
      latitude: input.latitude,
      longitude: input.longitude,
      quantite_constatee: input.quantiteConstatee,
      commentaire: input.commentaire,
    })
    .select()
    .single();
  if (error) throw error;

  const { data: expedition, error: expeditionErr } = await supabase
    .from("expeditions")
    .select("quantite_declaree")
    .eq("id", input.expeditionId)
    .single();
  if (expeditionErr) throw expeditionErr;

  const ecart =
    expedition.quantite_declaree != null &&
    input.quantiteConstatee != null &&
    input.quantiteConstatee !== expedition.quantite_declaree;

  if (ecart) {
    const { error: incidentErr } = await supabase.from("incidents").insert({
      expedition_id: input.expeditionId,
      type: "ecart_quantite",
      description: `Quantité déclarée ${expedition.quantite_declaree}, quantité constatée ${input.quantiteConstatee}.`,
    });
    if (incidentErr) throw incidentErr;
  }

  const { error: updateErr } = await supabase
    .from("expeditions")
    .update({ statut: ecart ? "litige" : "livre" })
    .eq("id", input.expeditionId);
  if (updateErr) throw updateErr;

  return data;
}
