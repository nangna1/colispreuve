// Les deux seules actions que le chauffeur prend hors-ligne : enregistrer
// une preuve d'enlèvement ou de livraison. Le payload embarque directement
// le Blob de la photo (et de la signature pour une livraison) — IndexedDB
// (donc idb-keyval) supporte nativement le clonage structuré de Blob, pas
// besoin de le convertir en base64.
export type QueuedAction =
  | {
      id: string;
      kind: "preuve_enlevement";
      createdAt: number;
      label: string;
      payload: {
        expeditionId: string;
        photo: Blob;
        latitude: number | null;
        longitude: number | null;
        quantiteConstatee: number | null;
        commentaire: string | null;
      };
    }
  | {
      id: string;
      kind: "preuve_livraison";
      createdAt: number;
      label: string;
      payload: {
        expeditionId: string;
        photo: Blob;
        signature: Blob | null;
        latitude: number | null;
        longitude: number | null;
        quantiteConstatee: number | null;
        commentaire: string | null;
      };
    };

export type NewQueuedAction =
  | Omit<Extract<QueuedAction, { kind: "preuve_enlevement" }>, "id" | "createdAt">
  | Omit<Extract<QueuedAction, { kind: "preuve_livraison" }>, "id" | "createdAt">;
