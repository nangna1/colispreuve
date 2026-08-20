-- ColisPreuve — schéma initial
-- Entreprises (expéditeurs), comptes expéditeur/chauffeur, expéditions,
-- preuves d'enlèvement/livraison, incidents/litiges.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────────────────

create table public.entreprises (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  telephone text,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('expediteur', 'chauffeur')),
  entreprise_id uuid not null references public.entreprises (id) on delete cascade,
  nom text not null,
  telephone text,
  -- Rempli uniquement pour un chauffeur : code de connexion à faible
  -- friction (voir lib/auth/driver-code.ts), même principe que le compte
  -- élève de Scolaris — un chauffeur se connecte souvent depuis un
  -- téléphone partagé de l'entreprise, pas d'e-mail/mot de passe à retenir.
  code text unique,
  created_at timestamptz not null default now(),
  constraint profile_code_chauffeur check (
    (role = 'chauffeur' and code is not null) or (role = 'expediteur' and code is null)
  )
);
create index on public.profiles (entreprise_id);

create table public.expeditions (
  id uuid primary key default gen_random_uuid(),
  entreprise_id uuid not null references public.entreprises (id) on delete cascade,
  chauffeur_id uuid references public.profiles (id) on delete set null,
  destinataire_nom text not null,
  destinataire_telephone text,
  adresse_enlevement text not null,
  adresse_livraison text not null,
  description_marchandise text,
  quantite_declaree int,
  statut text not null default 'cree'
    check (statut in ('cree', 'enleve', 'en_transit', 'livre', 'litige')),
  -- Clé d'accès au portail de suivi public (/suivi/[token]) : le
  -- destinataire n'a jamais de compte, l'accès passe par ce token opaque,
  -- validé côté serveur (voir app/actions/tracking.ts) plutôt que par une
  -- policy RLS ouverte à anon.
  token_public uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);
create index on public.expeditions (entreprise_id);
create index on public.expeditions (chauffeur_id);
create unique index on public.expeditions (token_public);

create table public.preuves (
  id uuid primary key default gen_random_uuid(),
  expedition_id uuid not null references public.expeditions (id) on delete cascade,
  type text not null check (type in ('enlevement', 'livraison')),
  photo_url text not null,
  signature_url text,
  latitude double precision,
  longitude double precision,
  quantite_constatee int,
  commentaire text,
  created_at timestamptz not null default now()
);
create index on public.preuves (expedition_id);

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  expedition_id uuid not null references public.expeditions (id) on delete cascade,
  type text not null check (type in ('ecart_quantite', 'dommage', 'retard', 'autre')),
  description text,
  lettre_generee_url text,
  statut text not null default 'ouvert' check (statut in ('ouvert', 'resolu')),
  created_at timestamptz not null default now()
);
create index on public.incidents (expedition_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Helper: current user's scope, bypassing RLS recursion sur profiles
-- ─────────────────────────────────────────────────────────────────────────

create function public.current_profile()
returns table (role text, entreprise_id uuid)
language sql
security definer
set search_path = public
stable
as $$
  select role, entreprise_id
  from public.profiles
  where id = auth.uid()
$$;

grant execute on function public.current_profile() to authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────────

alter table public.entreprises enable row level security;
alter table public.profiles enable row level security;
alter table public.expeditions enable row level security;
alter table public.preuves enable row level security;
alter table public.incidents enable row level security;

-- entreprises : visible par ses propres membres (expéditeur ou chauffeur)
create policy "entreprises_read" on public.entreprises
  for select using (id = (select entreprise_id from public.current_profile()));

-- profiles : chacun voit sa propre ligne, un expéditeur voit aussi les
-- chauffeurs de sa propre entreprise (pour les assigner à une expédition)
create policy "profiles_self" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_self_update" on public.profiles
  for update using (id = auth.uid());
create policy "profiles_entreprise_read" on public.profiles
  for select using (
    role = 'chauffeur'
    and entreprise_id = (select entreprise_id from public.current_profile())
  );

-- expeditions : un expéditeur gère toutes les expéditions de son
-- entreprise ; un chauffeur voit et met à jour uniquement celles qui lui
-- sont assignées (changement de statut au fil de sa course), il ne peut
-- pas en créer ni changer l'assignation.
create policy "expeditions_expediteur_all" on public.expeditions
  for all using (
    entreprise_id = (select entreprise_id from public.current_profile())
    and (select role from public.current_profile()) = 'expediteur'
  ) with check (
    entreprise_id = (select entreprise_id from public.current_profile())
    and (select role from public.current_profile()) = 'expediteur'
  );
create policy "expeditions_chauffeur_read" on public.expeditions
  for select using (chauffeur_id = auth.uid());
create policy "expeditions_chauffeur_update_statut" on public.expeditions
  for update using (chauffeur_id = auth.uid())
  with check (chauffeur_id = auth.uid());

-- preuves : un chauffeur peut créer une preuve sur une expédition qui lui
-- est assignée ; l'expéditeur titulaire de l'entreprise peut les consulter.
create policy "preuves_chauffeur_insert" on public.preuves
  for insert with check (
    expedition_id in (select id from public.expeditions where chauffeur_id = auth.uid())
  );
create policy "preuves_chauffeur_read" on public.preuves
  for select using (
    expedition_id in (select id from public.expeditions where chauffeur_id = auth.uid())
  );
create policy "preuves_expediteur_read" on public.preuves
  for select using (
    expedition_id in (
      select id from public.expeditions
      where entreprise_id = (select entreprise_id from public.current_profile())
    )
  );

-- incidents : gérés côté expéditeur uniquement (détection d'écart faite en
-- application, pas par trigger, pour rester simple à ce stade)
create policy "incidents_expediteur_all" on public.incidents
  for all using (
    expedition_id in (
      select id from public.expeditions
      where entreprise_id = (select entreprise_id from public.current_profile())
    )
  ) with check (
    expedition_id in (
      select id from public.expeditions
      where entreprise_id = (select entreprise_id from public.current_profile())
    )
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Privilèges de base (indépendants du réglage "Automatically expose new
-- tables" du dashboard) — aucun accès donné au rôle anon : le portail
-- public de suivi (/suivi/[token]) passe par une Server Action qui utilise
-- le client service_role après avoir validé le token, jamais par une
-- policy RLS ouverte.
-- ─────────────────────────────────────────────────────────────────────────

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
