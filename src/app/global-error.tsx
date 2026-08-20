"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// Filet de secours ultime si le layout racine lui-même plante — mêmes
// raisons/pattern que Scolaris (src/app/global-error.tsx) : ce fichier
// redéfinit ses propres balises html/body, styles inline plutôt que
// Tailwind/Google Fonts pour rester fonctionnel même si la cause du
// plantage est côté CSS/polices.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "Helvetica, Arial, sans-serif", background: "#F5F2EA", color: "#182235" }}>
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div
            style={{
              width: "100%",
              maxWidth: 360,
              borderRadius: 16,
              border: "1px solid #DDD4C0",
              background: "#FFFFFF",
              padding: 32,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700 }}>ColisPreuve</div>
            <p style={{ marginTop: 16, fontSize: 14, color: "#3E4A5E" }}>
              Une erreur inattendue a empêché le chargement de l&apos;application. L&apos;équipe technique en a été
              informée automatiquement.
            </p>
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                type="button"
                onClick={reset}
                style={{
                  borderRadius: 8,
                  background: "#2B4C7E",
                  color: "#FFFFFF",
                  padding: "12px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Réessayer
              </button>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- <a> volontaire :
                  ce fichier remplace tout le layout racine, <Link/> n'est pas fiable a garantir ici. */}
              <a
                href="/"
                style={{
                  borderRadius: 8,
                  border: "1px solid #D5CBB4",
                  color: "#62697A",
                  padding: "12px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Retour à l&apos;accueil
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
