import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Client Supabase avec la clé service_role — contourne complètement la RLS.
// Ne JAMAIS importer ce module depuis un composant "use client" ni exposer
// SUPABASE_SERVICE_ROLE_KEY avec le préfixe NEXT_PUBLIC_ : le paquet
// "server-only" fait volontairement échouer le build si ce fichier finit
// importé côté navigateur. Utilisé pour provisionner un compte chauffeur
// (auth.admin.createUser / updateUserById), une opération que la clé
// anonyme + RLS ne permet pas de faire soi-même.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY manquant (.env.local) — requis pour créer un accès chauffeur. " +
        "Project Settings → API → service_role secret, dans le dashboard Supabase.",
    );
  }
  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
