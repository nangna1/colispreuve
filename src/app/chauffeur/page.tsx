import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";
import { logout } from "@/app/actions/auth";

// Fondation uniquement pour l'instant. Le vrai flux chauffeur (liste des
// courses du jour, écrans Enlèvement/Livraison avec photo/géoloc/signature,
// file d'attente hors-ligne) est l'étape suivante du plan.
export default async function ChauffeurPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile || profile.role !== "chauffeur") redirect("/login");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 px-5 py-10">
      <h1 className="text-2xl font-bold text-navy-deep">Bonjour {profile.nom}</h1>
      <p className="text-sm text-ink-muted">
        App chauffeur — à venir : liste des courses du jour, enlèvement et livraison (photo, géolocalisation,
        signature), mode hors-ligne.
      </p>
      <form action={logout}>
        <button className="rounded-lg border border-border-input px-4 py-2 text-sm text-ink-muted hover:text-ink">
          Déconnexion
        </button>
      </form>
    </div>
  );
}
