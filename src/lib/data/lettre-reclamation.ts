import type { Preuve, Expedition } from "@/lib/data/expeditions";
import type { Incident } from "@/lib/data/incidents";
import type { Entreprise } from "@/lib/data/entreprises";

export interface LettreReclamation {
  objet: string;
  paragraphes: string[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// Contenu digitalisé et adapté à partir des modèles de lettres du kit
// "gestion et logistique" (registre identique : OBJET, formule d'appel,
// corps expliquant le litige et la demande, "Salutations distinguées",
// bloc signature) — avec la vraie différenciation du produit : la
// référence à la preuve photographique/géolocalisée horodatée plutôt qu'un
// simple constat déclaratif.
export function buildLettreReclamation(
  entreprise: Entreprise,
  expedition: Expedition,
  incident: Incident,
  preuveLivraison: Preuve | null,
  lienSuivi: string,
): LettreReclamation {
  const dateLivraison = preuveLivraison ? formatDate(preuveLivraison.created_at) : "récente";

  if (incident.type === "ecart_quantite") {
    const ecart =
      expedition.quantite_declaree != null && preuveLivraison?.quantite_constatee != null
        ? Math.abs(expedition.quantite_declaree - preuveLivraison.quantite_constatee)
        : null;
    return {
      objet: "Réclamation — écart de quantité constaté à la livraison",
      paragraphes: [
        `Madame, Monsieur ${expedition.destinataire_nom},`,
        `Nous accusons réception de la livraison correspondant à l'expédition à destination de ${expedition.adresse_livraison}, effectuée le ${dateLivraison}.`,
        `Lors de cette livraison, la quantité constatée par notre chauffeur (${preuveLivraison?.quantite_constatee ?? "non renseignée"}) diffère de la quantité déclarée au départ (${expedition.quantite_declaree ?? "non renseignée"})${ecart != null ? `, soit un écart de ${ecart} unité(s)` : ""}.`,
        `Cette constatation a été enregistrée avec une preuve photographique et une géolocalisation horodatées au moment même de la livraison, consultable à l'adresse suivante : ${lienSuivi}`,
        `Nous vous saurions gré de bien vouloir nous faire part de vos observations et des dispositions que vous comptez prendre concernant cet écart dans les meilleurs délais.`,
      ],
    };
  }

  if (incident.type === "dommage") {
    return {
      objet: "Réclamation — marchandise endommagée constatée à la livraison",
      paragraphes: [
        `Madame, Monsieur ${expedition.destinataire_nom},`,
        `Nous accusons réception de la livraison correspondant à l'expédition à destination de ${expedition.adresse_livraison}, effectuée le ${dateLivraison}.`,
        `Lors de cette livraison, un dommage a été constaté sur la marchandise${incident.description ? ` : ${incident.description}` : "."}`,
        `Cette constatation a été enregistrée avec une preuve photographique et une géolocalisation horodatées au moment même de la livraison, consultable à l'adresse suivante : ${lienSuivi}`,
        `Nous vous saurions gré de bien vouloir nous faire part de vos observations et des dispositions que vous comptez prendre concernant ce dommage dans les meilleurs délais.`,
      ],
    };
  }

  // retard / autre : contenu générique mais toujours ancré sur la preuve.
  return {
    objet: "Réclamation relative à l'expédition",
    paragraphes: [
      `Madame, Monsieur ${expedition.destinataire_nom},`,
      `Nous revenons vers vous au sujet de l'expédition à destination de ${expedition.adresse_livraison}.`,
      incident.description ?? "Un incident a été constaté sur cette expédition.",
      `Cette constatation est consultable, avec ses preuves horodatées, à l'adresse suivante : ${lienSuivi}`,
      `Nous vous saurions gré de bien vouloir nous faire part de vos observations dans les meilleurs délais.`,
    ],
  };
}
