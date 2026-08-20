"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExpedition } from "@/app/actions/expeditions";
import type { Chauffeur } from "@/lib/data/expeditions";

export default function NouvelleExpeditionForm({ chauffeurs }: { chauffeurs: Chauffeur[] }) {
  const router = useRouter();
  const [destinataireNom, setDestinataireNom] = useState("");
  const [destinataireTelephone, setDestinataireTelephone] = useState("");
  const [adresseEnlevement, setAdresseEnlevement] = useState("");
  const [adresseLivraison, setAdresseLivraison] = useState("");
  const [descriptionMarchandise, setDescriptionMarchandise] = useState("");
  const [quantiteDeclaree, setQuantiteDeclaree] = useState("");
  const [chauffeurId, setChauffeurId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createExpedition({
      destinataireNom,
      destinataireTelephone: destinataireTelephone || undefined,
      adresseEnlevement,
      adresseLivraison,
      descriptionMarchandise: descriptionMarchandise || undefined,
      quantiteDeclaree: quantiteDeclaree ? Number(quantiteDeclaree) : undefined,
      chauffeurId: chauffeurId || undefined,
    });

    setLoading(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    router.push(`/expediteur/expeditions/${res.id}`);
  }

  const inputClass =
    "rounded-lg border border-border-input bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-navy";
  const labelClass = "text-xs font-medium text-ink-muted";

  return (
    <form onSubmit={submit} className="flex max-w-lg flex-col gap-4 rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="destinataireNom">
          Nom du destinataire *
        </label>
        <input
          id="destinataireNom"
          required
          value={destinataireNom}
          onChange={(e) => setDestinataireNom(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="destinataireTelephone">
          Téléphone du destinataire
        </label>
        <input
          id="destinataireTelephone"
          value={destinataireTelephone}
          onChange={(e) => setDestinataireTelephone(e.target.value)}
          placeholder="Ex. 07 48 12 90"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="adresseEnlevement">
          Adresse d&apos;enlèvement *
        </label>
        <input
          id="adresseEnlevement"
          required
          value={adresseEnlevement}
          onChange={(e) => setAdresseEnlevement(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="adresseLivraison">
          Adresse de livraison *
        </label>
        <input
          id="adresseLivraison"
          required
          value={adresseLivraison}
          onChange={(e) => setAdresseLivraison(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="descriptionMarchandise">
          Description de la marchandise
        </label>
        <input
          id="descriptionMarchandise"
          value={descriptionMarchandise}
          onChange={(e) => setDescriptionMarchandise(e.target.value)}
          placeholder="Ex. 200 sacs de riz 25kg"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="quantiteDeclaree">
          Quantité déclarée
        </label>
        <input
          id="quantiteDeclaree"
          type="number"
          min={0}
          value={quantiteDeclaree}
          onChange={(e) => setQuantiteDeclaree(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="chauffeurId">
          Chauffeur (optionnel, assignable plus tard)
        </label>
        <select
          id="chauffeurId"
          value={chauffeurId}
          onChange={(e) => setChauffeurId(e.target.value)}
          className={inputClass}
        >
          <option value="">— Non assigné —</option>
          {chauffeurs.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
        {chauffeurs.length === 0 && (
          <div className="text-xs text-ink-faint">
            Aucun chauffeur enregistré — vous pourrez en ajouter un depuis l&apos;onglet Chauffeurs et assigner cette
            expédition ensuite.
          </div>
        )}
      </div>

      {error && <div className="text-sm text-rouge">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white hover:bg-navy-dark disabled:opacity-60"
      >
        {loading ? "Création…" : "Créer l'expédition"}
      </button>
    </form>
  );
}
