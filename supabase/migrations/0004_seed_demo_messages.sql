-- Conversaciones de demostración
insert into public.messages (listing_id, sender_id, receiver_id, body, read_at, created_at)
values
  -- Chat sobre el PS4 (vendedora: maria)
  ((select id from public.listings where title like 'PS4%' limit 1),
   (select id from auth.users where email = 'dayana@islamercado.cu'),
   (select id from auth.users where email = 'maria@islamercado.cu'),
   'Hola! Sigue disponible el PS4?', now() - interval '3 hours', now() - interval '3 hours'),

  ((select id from public.listings where title like 'PS4%' limit 1),
   (select id from auth.users where email = 'maria@islamercado.cu'),
   (select id from auth.users where email = 'dayana@islamercado.cu'),
   'Hola! Sí, disponible. Tiene 2 mandos originales y los 5 juegos que aparecen.',
   now() - interval '2 hours', now() - interval '2 hours'),

  ((select id from public.listings where title like 'PS4%' limit 1),
   (select id from auth.users where email = 'dayana@islamercado.cu'),
   (select id from auth.users where email = 'maria@islamercado.cu'),
   'Perfecto. ¿Lo dejas en 220 y nos vemos por el Vedado?', null, now() - interval '90 minutes'),

  -- Chat sobre la bicicleta (vendedor: pedro)
  ((select id from public.listings where title like 'Bicicleta%' limit 1),
   (select id from auth.users where email = 'maria@islamercado.cu'),
   (select id from auth.users where email = 'pedro@islamercado.cu'),
   'Hola, ¿la bici sigue disponible? Podría recogerla el sábado.', null, now() - interval '26 hours'),

  -- Chat sobre el panel solar (vendedora: dayana)
  ((select id from public.listings where title like 'Panel solar%' limit 1),
   (select id from auth.users where email = 'pedro@islamercado.cu'),
   (select id from auth.users where email = 'dayana@islamercado.cu'),
   '¿Hacen envío a Camagüey del panel?', now() - interval '5 hours', now() - interval '6 hours');
