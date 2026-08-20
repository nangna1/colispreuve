import { getExpeditionByToken } from "@/app/actions/tracking";

const STATUT_LABEL: Record<string, string> = {
  cree: "En préparation",
  enleve: "Enlevé",
  en_transit: "En transit",
  livre: "Livré",
  litige: "Litige en cours",
};

// Portail public : aucune authentification (voir src/proxy.ts,
// isPublicRoute). Accessible uniquement via le lien exact envoyé au
// destinataire.
export default async function SuiviPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const info = await getExpeditionByToken(token);

  if ("error" in info) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper-sunk px-4">
        <p className="text-sm text-rouge">{info.error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-sunk px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-[0_24px_60px_rgba(22,35,61,0.12)]">
        <div className="text-xs uppercase tracking-[0.14em] text-ink-faint">Suivi de colis</div>
        <div className="mt-1 text-lg font-semibold text-navy-deep">{info.destinataireNom}</div>
        <div className="mt-4 rounded-lg bg-navy-tint px-4 py-3 text-center text-sm font-semibold text-navy">
          {STATUT_LABEL[info.statut] ?? info.statut}
        </div>
        <div className="mt-4 text-sm text-ink-muted">Livraison à : {info.adresseLivraison}</div>
      </div>
    </div>
  );
}
