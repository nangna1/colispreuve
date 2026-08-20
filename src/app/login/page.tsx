"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { driverEmailFor } from "@/lib/auth/driver-code";

type Mode = "expediteur" | "chauffeur";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("expediteur");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } =
      mode === "expediteur"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signInWithPassword({ email: driverEmailFor(code), password: code.trim().toUpperCase() });

    if (error) {
      setError(mode === "expediteur" ? "Identifiants incorrects." : "Code incorrect.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-sunk px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-[0_24px_60px_rgba(22,35,61,0.12)]">
        <div className="mb-6 flex flex-col items-center gap-1 text-center">
          <div className="text-2xl font-bold text-navy-deep">ColisPreuve</div>
          <div className="text-xs uppercase tracking-[0.14em] text-ink-faint">Connexion</div>
        </div>

        <div className="mb-6 flex rounded-lg border border-border-input bg-white p-1">
          <button
            type="button"
            onClick={() => setMode("expediteur")}
            className={`flex-1 rounded-md py-2 text-xs font-semibold ${
              mode === "expediteur" ? "bg-navy text-white" : "text-ink-muted"
            }`}
          >
            Expéditeur
          </button>
          <button
            type="button"
            onClick={() => setMode("chauffeur")}
            className={`flex-1 rounded-md py-2 text-xs font-semibold ${
              mode === "chauffeur" ? "bg-navy text-white" : "text-ink-muted"
            }`}
          >
            Chauffeur
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {mode === "expediteur" ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-muted" htmlFor="email">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg border border-border-input bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-navy"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-muted" htmlFor="password">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-lg border border-border-input bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-navy"
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink-muted" htmlFor="code">
                Code d&apos;accès
              </label>
              <input
                id="code"
                type="text"
                required
                autoCapitalize="characters"
                placeholder="Ex. 7F3K9QRT"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                dir="ltr"
                className="rounded-lg border border-border-input bg-white px-3 py-3 text-center text-lg font-semibold tracking-[0.15em] text-ink outline-none focus:border-navy"
              />
              <div className="text-center text-[11px] text-ink-faint">Le code donné par votre entreprise</div>
            </div>
          )}

          {error && <div className="text-sm text-rouge">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white hover:bg-navy-dark disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
