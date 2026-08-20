import { createClient } from "@/lib/supabase/server";
import { getChauffeurs } from "@/lib/data/expeditions";
import ChauffeursList from "./chauffeurs-list";

export default async function ChauffeursPage() {
  const supabase = await createClient();
  const chauffeurs = await getChauffeurs(supabase);

  return (
    <div className="flex flex-col">
      <div className="flex items-end justify-between gap-6 border-b border-border bg-card px-[34px] pb-[18px] pt-6">
        <div className="text-[27px] font-bold tracking-tight text-navy-deep">Chauffeurs</div>
      </div>
      <div className="px-[34px] py-[26px]">
        <ChauffeursList chauffeurs={chauffeurs} />
      </div>
    </div>
  );
}
