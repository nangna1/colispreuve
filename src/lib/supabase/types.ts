// Types écrits à la main en miroir du schéma SQL (supabase/migrations/) —
// même pattern que Scolaris (madrasa-ci/src/lib/supabase/types.ts). À
// régénérer avec `supabase gen types typescript` une fois le projet créé,
// si on préfère automatiser plus tard.

export type ProfileRole = "expediteur" | "chauffeur";
export type ExpeditionStatut = "cree" | "enleve" | "en_transit" | "livre" | "litige";
export type PreuveType = "enlevement" | "livraison";
export type IncidentType = "ecart_quantite" | "dommage" | "retard" | "autre";
export type IncidentStatut = "ouvert" | "resolu";

export interface Database {
  public: {
    Tables: {
      entreprises: {
        Row: {
          id: string;
          nom: string;
          telephone: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["entreprises"]["Row"]> & {
          nom: string;
        };
        Update: Partial<Database["public"]["Tables"]["entreprises"]["Row"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          role: ProfileRole;
          entreprise_id: string;
          nom: string;
          telephone: string | null;
          code: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          role: ProfileRole;
          entreprise_id: string;
          nom: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      expeditions: {
        Row: {
          id: string;
          entreprise_id: string;
          chauffeur_id: string | null;
          destinataire_nom: string;
          destinataire_telephone: string | null;
          adresse_enlevement: string;
          adresse_livraison: string;
          description_marchandise: string | null;
          quantite_declaree: number | null;
          statut: ExpeditionStatut;
          token_public: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["expeditions"]["Row"]> & {
          entreprise_id: string;
          destinataire_nom: string;
          adresse_enlevement: string;
          adresse_livraison: string;
        };
        Update: Partial<Database["public"]["Tables"]["expeditions"]["Row"]>;
        Relationships: [];
      };
      preuves: {
        Row: {
          id: string;
          expedition_id: string;
          type: PreuveType;
          photo_url: string;
          signature_url: string | null;
          latitude: number | null;
          longitude: number | null;
          quantite_constatee: number | null;
          commentaire: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["preuves"]["Row"]> & {
          expedition_id: string;
          type: PreuveType;
          photo_url: string;
        };
        Update: Partial<Database["public"]["Tables"]["preuves"]["Row"]>;
        Relationships: [];
      };
      incidents: {
        Row: {
          id: string;
          expedition_id: string;
          type: IncidentType;
          description: string | null;
          lettre_generee_url: string | null;
          statut: IncidentStatut;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["incidents"]["Row"]> & {
          expedition_id: string;
          type: IncidentType;
        };
        Update: Partial<Database["public"]["Tables"]["incidents"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
