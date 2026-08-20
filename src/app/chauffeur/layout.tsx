import { redirect } from "next/navigation";
import type { Metadata, Viewport } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";
import ChauffeurShell from "./chauffeur-shell";

export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "ColisPreuve" },
};

export const viewport: Viewport = {
  themeColor: "#16233D",
};

export default async function ChauffeurLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile || profile.role !== "chauffeur") redirect("/login");

  return <ChauffeurShell nom={profile.nom}>{children}</ChauffeurShell>;
}
