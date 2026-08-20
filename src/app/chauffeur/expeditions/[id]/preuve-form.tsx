"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useOffline } from "@/lib/offline/offline-context";
import { enregistrerPreuveEnlevement, enregistrerPreuveLivraison } from "@/lib/data/preuves";
import SignaturePad from "./signature-pad";

type Type = "enlevement" | "livraison";

export default function PreuveForm({ expeditionId, type }: { expeditionId: string; type: Type }) {
  const router = useRouter();
  const { runOrQueue } = useOffline();
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [signature, setSignature] = useState<Blob | null>(null);
  const [quantite, setQuantite] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"synced" | "queued" | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      // setState différé (microtask) plutôt qu'appelé de façon synchrone
      // dans le corps de l'effet — règle react-hooks/set-state-in-effect,
      // même contournement que côté Scolaris/ArtiBot cette session.
      queueMicrotask(() => setGeoError("Géolocalisation indisponible sur cet appareil."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setGeoError("Position non obtenue — vérifiez l'autorisation de localisation."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!photo) {
      setError("Une photo est requise.");
      return;
    }
    setLoading(true);
    setError(null);

    const commonPayload = {
      expeditionId,
      photo,
      latitude: position?.latitude ?? null,
      longitude: position?.longitude ?? null,
      quantiteConstatee: quantite ? Number(quantite) : null,
      commentaire: commentaire || null,
    };

    try {
      const result =
        type === "enlevement"
          ? await runOrQueue(
              { kind: "preuve_enlevement", label: "Preuve d'enlèvement", payload: commonPayload },
              () => enregistrerPreuveEnlevement(createClient(), commonPayload),
            )
          : await runOrQueue(
              { kind: "preuve_livraison", label: "Preuve de livraison", payload: { ...commonPayload, signature } },
              () => enregistrerPreuveLivraison(createClient(), { ...commonPayload, signature }),
            );
      setDone(result.synced ? "synced" : "queued");
      setTimeout(() => {
        router.push("/chauffeur");
        router.refresh();
      }, 1400);
    } catch {
      setError("Échec de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-dashed border-navy bg-navy-tint p-6 text-center text-sm text-ink">
        {done === "synced" ? "Preuve enregistrée." : "Hors ligne — preuve mise en file, sera envoyée au retour du réseau."}
      </div>
    );
  }

  const inputClass =
    "rounded-lg border border-border-input bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-navy";

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-ink-muted">Photo *</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPhotoChange}
          required
          className="text-sm"
        />
        {photoPreview && (
          // eslint-disable-next-line @next/next/no-img-element -- prévisualisation locale (URL.createObjectURL), pas une image distante
          <img src={photoPreview} alt="Aperçu" className="mt-1 w-full rounded-lg" />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-ink-muted">Quantité constatée</label>
        <input
          type="number"
          min={0}
          value={quantite}
          onChange={(e) => setQuantite(e.target.value)}
          className={inputClass}
        />
      </div>

      {type === "livraison" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ink-muted">Signature du destinataire</label>
          <SignaturePad onChange={setSignature} />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-ink-muted">Commentaire</label>
        <textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          rows={2}
          className={inputClass}
        />
      </div>

      <div className="text-xs text-ink-faint">
        {position
          ? `Position : ${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}`
          : geoError ?? "Localisation en cours…"}
      </div>

      {error && <div className="text-sm text-rouge">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white hover:bg-navy-dark disabled:opacity-60"
      >
        {loading ? "Enregistrement…" : type === "enlevement" ? "Confirmer l'enlèvement" : "Confirmer la livraison"}
      </button>
    </form>
  );
}
