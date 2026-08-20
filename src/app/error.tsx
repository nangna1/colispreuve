"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

// Filet de secours pour toute erreur non gérée dans un segment de route —
// même pattern que Scolaris (src/app/error.tsx), mis en place dès la
// fondation cette fois plutôt qu'après coup.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-[0_24px_60px_rgba(22,35,61,0.12)]">
        <div className="text-2xl font-bold text-navy-deep">ColisPreuve</div>
        <p className="mt-4 text-sm text-ink-soft">
          Une erreur inattendue s&apos;est produite. L&apos;équipe technique en a été informée automatiquement.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white hover:bg-navy-dark"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="rounded-lg border border-border-input px-4 py-3 text-sm font-semibold text-ink-muted hover:text-ink"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
