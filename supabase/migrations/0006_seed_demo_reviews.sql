-- Reseñas de demostración
insert into public.reviews (author_id, seller_id, rating, comment, created_at)
values
  ((select id from auth.users where email = 'dayana@islamercado.cu'),
   (select id from auth.users where email = 'maria@islamercado.cu'),
   5,
   'María vendió el sofá tal como lo describió. Puntual y amable, ayudó a cargarlo al transporte. Recomendada 100%.',
   now() - interval '12 days'),

  ((select id from auth.users where email = 'pedro@islamercado.cu'),
   (select id from auth.users where email = 'maria@islamercado.cu'),
   4,
   'Muy buena comunicación y respuesta rápida. El PS4 está como nuevo.',
   now() - interval '5 days'),

  ((select id from auth.users where email = 'maria@islamercado.cu'),
   (select id from auth.users where email = 'dayana@islamercado.cu'),
   5,
   'El panel llegó sellado y con su garantía. Excelente vendedora, muy clara con la información.',
   now() - interval '3 days'),

  ((select id from auth.users where email = 'dayana@islamercado.cu'),
   (select id from auth.users where email = 'pedro@islamercado.cu'),
   4,
   'La bicicleta estaba como la describió. Serio en el trato y flexible con la recogida.',
   now() - interval '8 days')
on conflict (author_id, seller_id) do nothing;
