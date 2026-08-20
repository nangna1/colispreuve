import { getExpeditionByToken } from "@/app/actions/tracking";

const STATUT_LABEL: Record<string, string> = {
  cree: "En préparation",
  enleve: "Enlevé",
  en_transit: "En transit",
  livre: "Livré",
  litige: "Litige en cours",
};

const STATUT_STYLE: Record<string, { bg: string; fg: string }> = {
  cree: { bg: "var(--color-paper-sunk)", fg: "var(--color-ink-muted)" },
  enleve: { bg: "var(--color-navy-tint)", fg: "var(--color-navy)" },
  en_transit: { bg: "#FBEFD6", fg: "#8A6218" },
  livre: { bg: "#E4F3E8", fg: "#1F7A45" },
  litige: { bg: "var(--color-rouge-tint)", fg: "var(--color-rouge)" },
};

const PREUVE_LABEL: Record<string, string> = {
  enlevement: "Colis enlevé",
  livraison: "Colis livré",
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

  const status = STATUT_STYLE[info.statut] ?? STATUT_STYLE.cree;

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-sunk px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-[0_24px_60px_rgba(22,35,61,0.12)]">
        <div className="text-xs uppercase tracking-[0.14em] text-ink-faint">Suivi de colis</div>
        <div className="mt-1 text-lg font-semibold text-navy-deep">{info.destinataireNom}</div>
        <div
          className="mt-4 rounded-lg px-4 py-3 text-center text-sm font-semibold"
          style={{ background: status.bg, color: status.fg }}
        >
          {STATUT_LABEL[info.statut] ?? info.statut}
        </div>
        <div className="mt-4 text-sm text-ink-muted">Livraison à : {info.adresseLivraison}</div>

        {info.preuves.length > 0 && (
          <div className="mt-6 flex flex-col gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">Preuves</div>
            {info.preuves.map((p, i) => (
              <div key={i} className="rounded-lg border border-border-soft p-2.5">
                <div className="flex items-center justify-between text-[11px] text-ink-muted">
                  <span className="font-semibold text-ink">{PREUVE_LABEL[p.type] ?? p.type}</span>
                  <span>{new Date(p.createdAt).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element -- image distante Supabase Storage, next/image demanderait un domaine configuré à l'avance */}
                <img src={p.photoUrl} alt={PREUVE_LABEL[p.type] ?? p.type} className="mt-2 w-full rounded" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
