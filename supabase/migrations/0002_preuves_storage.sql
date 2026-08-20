-- Stockage des photos/signatures de preuve (enlèvement/livraison) — bucket
-- public dédié, même raisonnement que les autres projets de la famille
-- (contenu photographique de preuve, pas de donnée sensible nécessitant des
-- URLs signées ; chemin "{expedition_id}/{type}-{timestamp}.jpg" ou
-- "signature-{timestamp}.png" — voir src/lib/data/preuves.ts).

insert into storage.buckets (id, name, public) values ('preuves', 'preuves', true);

create policy "Preuves publiques en lecture" on storage.objects
  for select using (bucket_id = 'preuves');

-- Écriture réservée au chauffeur assigné à L'EXPÉDITION précise dont l'id
-- forme le premier segment du chemin — jamais "n'importe quel chauffeur de
-- l'entreprise".
create policy "Chauffeur assigné peut déposer une preuve" on storage.objects
  for insert
  with check (
    bucket_id = 'preuves'
    and exists (
      select 1 from public.expeditions
      where id::text = (storage.foldername(name))[1]
      and chauffeur_id = auth.uid()
    )
  );
