-- Correctif : sur ce projet, service_role n'avait pas les privilèges de
-- base sur les tables (constaté réellement le 2026-08-20 : "permission
-- denied for table entreprises" malgré BYPASSRLS, qui ne dispense pas des
-- GRANT eux-mêmes — probablement lié au fait que "Automatically expose new
-- tables" a été décoché à la création du projet, ce qui semble avoir aussi
-- sauté les privilèges par défaut habituellement posés pour service_role).
-- Nécessaire pour createDriverAccess (admin.ts) et le portail public de
-- suivi (tracking.ts), qui utilisent tous deux le client service_role.

grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
