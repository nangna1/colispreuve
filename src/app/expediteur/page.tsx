import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";
import { logout } from "@/app/actions/auth";

// Fondation uniquement pour l'instant : confirme que la connexion et le
// schéma fonctionnent de bout en bout. Le vrai tableau de bord (liste des
// expéditions, création, assignation chauffeur) est l'étape suivante du
// plan (voir C:\Users\HP\.claude\plans\sequential-dreaming-coral.md).
export default async function ExpediteurPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile || profile.role !== "expediteur") redirect("/login");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 px-5 py-10">
      <h1 className="text-2xl font-bold text-navy-deep">Bonjour {profile.nom}</h1>
      <p className="text-sm text-ink-muted">
        Tableau de bord expéditeur — à venir : liste des expéditions, création, assignation d&apos;un chauffeur.
      </p>
      <form action={logout}>
        <button className="rounded-lg border border-border-input px-4 py-2 text-sm text-ink-muted hover:text-ink">
          Déconnexion
        </button>
      </form>
    </div>
  );
}
