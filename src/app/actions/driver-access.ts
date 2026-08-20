"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/data/profile";
import { generateDriverCode, driverEmailFor } from "@/lib/auth/driver-code";

type Result = { code: string } | { error: string };

// Crée un compte chauffeur (code de connexion à faible friction, pas
// d'e-mail/mot de passe) pour l'entreprise de l'expéditeur appelant — même
// pattern que createTeacherAccount/createStudentAccess côté Scolaris. Le
// code n'est affiché qu'une seule fois côté UI, à transmettre au chauffeur
// (WhatsApp/oral).
export async function createDriverAccess(input: { nom: string; telephone?: string }): Promise<Result> {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile || profile.role !== "expediteur") {
    return { error: "Non autorisé." };
  }

  const nom = input.nom.trim();
  if (!nom) return { error: "Nom complet requis." };

  const admin = createAdminClient();

  let lastError: string | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateDriverCode();
    const email = driverEmailFor(code);

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password: code,
      email_confirm: true,
    });
    if (createErr || !created.user) {
      lastError = createErr?.message ?? "Erreur inconnue.";
      continue;
    }

    const { error: profileErr } = await admin.from("profiles").insert({
      id: created.user.id,
      role: "chauffeur",
      entreprise_id: profile.entreprise_id,
      nom,
      telephone: input.telephone?.trim() || null,
      code,
    });
    if (!profileErr) return { code };

    // Le compte auth a été créé mais pas le profil applicatif : on le
    // supprime pour ne pas laisser un compte chauffeur orphelin.
    await admin.auth.admin.deleteUser(created.user.id);
    lastError = profileErr.message;
  }

  return { error: lastError ?? "Échec de la création de l'accès après plusieurs tentatives." };
}
