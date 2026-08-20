-- Gabarit pour créer la première entreprise et son compte expéditeur.
-- auth.users ne peut pas être peuplée par migration (mots de passe hachés
-- gérés par Supabase Auth) : créez d'abord le compte via le dashboard
-- Supabase (Authentication → Users → Add user), puis exécutez ceci en
-- remplaçant l'UUID par celui du compte créé.

insert into public.entreprises (id, nom, telephone)
values ('00000000-0000-0000-0000-000000000001', 'Entreprise de démo', '07 00 00 00');

insert into public.profiles (id, role, entreprise_id, nom, telephone)
values (
  'REMPLACER-PAR-UUID-AUTH-USER',
  'expediteur',
  '00000000-0000-0000-0000-000000000001',
  'Expéditeur Démo',
  '07 00 00 00'
);
