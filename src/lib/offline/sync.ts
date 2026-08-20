import type { SupabaseClient } from "@supabase/supabase-js";
import * as Sentry from "@sentry/nextjs";
import type { Database } from "@/lib/supabase/types";
import { getQueue, removeFromQueue } from "./queue";
import { enregistrerPreuveEnlevement, enregistrerPreuveLivraison } from "@/lib/data/preuves";

export async function flushQueue(
  supabase: SupabaseClient<Database>,
): Promise<{ synced: number; failed: number }> {
  const queue = await getQueue();
  let synced = 0;
  let failed = 0;

  for (const action of queue) {
    try {
      switch (action.kind) {
        case "preuve_enlevement":
          await enregistrerPreuveEnlevement(supabase, action.payload);
          break;
        case "preuve_livraison":
          await enregistrerPreuveLivraison(supabase, action.payload);
          break;
      }
      await removeFromQueue(action.id);
      synced++;
    } catch (err) {
      // Ce flush n'est appelé qu'au retour en ligne (voir offline-context.tsx)
      // : un échec ici n'est donc plus un simple "pas de réseau" mais
      // potentiellement un vrai bug (upload Storage refusé, RLS, etc.) —
      // même raisonnement que Scolaris (lib/offline/sync.ts).
      console.error("offline sync: échec sur une action en file", action.kind, err);
      Sentry.captureException(err, { extra: { actionKind: action.kind, actionId: action.id } });
      failed++;
    }
  }

  return { synced, failed };
}
