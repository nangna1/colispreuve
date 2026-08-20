import * as Sentry from "@sentry/nextjs";

// Convention Next.js pour l'instrumentation serveur/edge (voir
// node_modules/next/dist/docs/01-app/02-guides/instrumentation.md). Mis en
// place dès la fondation du projet (contrairement à Scolaris, où l'absence
// de surveillance d'erreurs a été découverte après coup) — même schéma
// action->argent (preuve de livraison, litiges) que Scolaris, pas de raison
// de refaire la même impasse.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
