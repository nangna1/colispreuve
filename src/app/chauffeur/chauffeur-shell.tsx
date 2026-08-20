"use client";

import { logout } from "@/app/actions/auth";
import { OfflineProvider, useOffline } from "@/lib/offline/offline-context";
import ServiceWorkerRegister from "./service-worker-register";

export default function ChauffeurShell({ nom, children }: { nom: string; children: React.ReactNode }) {
  return (
    <OfflineProvider>
      <ServiceWorkerRegister />
      <ChauffeurShellInner nom={nom}>{children}</ChauffeurShellInner>
    </OfflineProvider>
  );
}

function ChauffeurShellInner({ nom, children }: { nom: string; children: React.ReactNode }) {
  const { online, pendingCount, syncing, flush } = useOffline();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-paper">
      <header className="flex flex-col gap-3 bg-navy-deep px-5 pb-4 pt-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="text-[17px] font-semibold">{nom}</div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-white/30 px-2.5 py-1 text-[11px]">
              <span
                className="h-[7px] w-[7px] rounded-full"
                style={{ background: online ? "#8ED6A8" : "var(--color-amber)" }}
              />
              <span>{online ? "En ligne" : "Hors ligne"}</span>
            </div>
            <form action={logout}>
              <button className="rounded-full border border-white/30 px-3 py-1.5 text-xs hover:bg-white/10">
                Déconnexion
              </button>
            </form>
          </div>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center justify-between gap-2.5 rounded-[10px] bg-black/[0.18] px-3 py-2.5 text-xs text-[#E7DFCB]">
            <span>
              {pendingCount} {pendingCount > 1 ? "preuves" : "preuve"} en attente d&apos;envoi
            </span>
            <button onClick={flush} disabled={syncing || !online} className="underline disabled:opacity-50">
              {syncing ? "Synchronisation…" : "Synchroniser"}
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-5">{children}</main>
    </div>
  );
}
