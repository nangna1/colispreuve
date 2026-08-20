// Interface d'envoi SMS/WhatsApp au destinataire (lien de suivi de son
// colis, /suivi/[token]). Aucune implémentation réelle tant qu'un compte
// WhatsApp Business API (Meta) ou un fournisseur SMS n'est pas obtenu.
// Remplacer `consoleMessagingProvider` une fois les identifiants
// disponibles — même principe que Scolaris
// (src/lib/providers/messaging-provider.ts).

export interface TrackingMessage {
  toPhone: string;
  body: string;
}

export interface MessagingProvider {
  send(msg: TrackingMessage): Promise<{ ok: true } | { ok: false; error: string }>;
}

/**
 * TODO(intégration réelle) : brancher la Meta WhatsApp Business Cloud API
 * (ou un fournisseur SMS type Twilio/Orange SMS API) une fois le compte
 * créé. En attendant, cette implémentation journalise l'envoi sans
 * contacter d'API.
 */
export const consoleMessagingProvider: MessagingProvider = {
  async send(msg) {
    console.info("[messaging-provider:stub] envoi", msg);
    return { ok: true };
  },
};
