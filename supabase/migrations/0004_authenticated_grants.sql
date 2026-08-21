-- Correctif : même famille de bug que 0003 (service_role), constaté cette
-- fois sur "authenticated" via un vrai test de connexion + lecture RLS
-- ("permission denied for table profiles" après un login reussi). Le GRANT
-- posé en toute fin de 0001_init.sql n'a apparemment pas tenu (probablement
-- lié au même réglage "Automatically expose new tables" décoché à la
-- création du projet) — on le repose explicitement ici, séparément,
-- vérifié par script juste après exécution.

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
