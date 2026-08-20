import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";
import ExpediteurShell from "./expediteur-shell";

export default async function ExpediteurLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile || profile.role !== "expediteur") redirect("/login");

  return <ExpediteurShell nom={profile.nom}>{children}</ExpediteurShell>;
}
