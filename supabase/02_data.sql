-- =====================================================================
--  ShoeShop : migration des données MySQL -> Supabase
--  À exécuter APRÈS 01_schema.sql, dans le SQL Editor.
--
--  PRÉREQUIS : exécuter d abord 02_users.private.sql (non versionné : emails + hash).
--  Images : les chemins '/images/xxx.png' sont conservés tels quels ;
--  il suffit d'uploader les fichiers dans le bucket "shoes" sous le
--  dossier images/ (voir README_MIGRATION.md).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 2. CATALOGUE
-- ---------------------------------------------------------------------
insert into public.shoes (id, name, brand, price, image_url) overriding system value values
  (1, 'Air Max 90',    'Nike',        150.00, '/images/product-1.png'),
  (2, 'Ultraboost 22', 'Adidas',      159.99, '/images/product-2.png'),
  (5, '574 Classic',   'New Balance',  89.99, '/images/product-6.png'),
  (6, 'Stan Smith',    'Adidas',       99.99, '/images/product-1.png'),
  (8, 'Nike TN',       'Nike',        100.00, '/images/noir_20260210_192937.jpeg');

insert into public.shoe_colors (id, shoe_id, color_name, color_code, image_url) overriding system value values
  (1,  1, 'Blanc',      '#FFFFFF', '/images/product-2.png'),
  (2,  1, 'Noir',       '#000000', '/images/product-4.png'),
  (4,  2, 'Noir',       '#000000', '/images/product-2.png'),
  (10, 5, 'Gris',       '#808080', '/images/product-.png'),
  (11, 5, 'Bleu',       '#0000FF', '/images/product-2.png'),
  (12, 6, 'Blanc/Vert', '#FFFFFF', '/images/product-4.png'),
  (13, 6, 'Blanc/Bleu', '#FFFFFF', '/images/product-2.png'),
  (15, 8, 'Noir',       '#000000', '/images/noir_20260210_192937.jpeg'),
  (16, 8, 'Blanc',      '#ffffff', '/images/blanc_20260210_192937.jpeg');

insert into public.shoe_sizes (id, shoe_id, size, quantity) overriding system value values
  (1, 1, 40, 9),  (2, 1, 41, 15), (3, 1, 42, 20), (4, 1, 43, 14), (5, 1, 44, 10), (6, 1, 45, 5),
  (7, 2, 40, 6),  (8, 2, 41, 12), (9, 2, 42, 18), (10, 2, 43, 14), (11, 2, 44, 8), (12, 2, 45, 4),
  (25, 5, 40, 10), (26, 5, 41, 12), (27, 5, 42, 15), (28, 5, 43, 12), (29, 5, 44, 8),
  (30, 6, 39, 15), (31, 6, 40, 14), (32, 6, 41, 25), (33, 6, 42, 25), (34, 6, 43, 18), (35, 6, 44, 10),
  (38, 8, 39, 8),  (39, 8, 42, 40);

-- ---------------------------------------------------------------------
-- 3. PANIERS ET COMMANDES
-- ---------------------------------------------------------------------
insert into public.carts (id, user_id) overriding system value values
  (1, '00000000-0000-4000-a000-000000000003');

insert into public.cart_items (id, cart_id, shoe_id, color_id, size, quantity) overriding system value values
  (10, 1, 2, 4, 40, 1);

insert into public.orders (id, user_id, order_date, status, total_amount) overriding system value values
  (1, '00000000-0000-4000-a000-000000000003', '2026-02-03 15:58:56+00', 'Pending', 129.99),
  (2, '00000000-0000-4000-a000-000000000003', '2026-02-03 16:00:19+00', 'Pending', 459.96),
  (3, '00000000-0000-4000-a000-000000000003', '2026-02-03 16:05:15+00', 'Pending', 949.89),
  (4, '00000000-0000-4000-a000-000000000003', '2026-02-10 18:31:44+00', 'Pending', 399.98);

insert into public.order_items (id, order_id, shoe_id, color_id, size, quantity, price) overriding system value values
  (1, 1, 1, 1,  40, 1, 129.99),
  (2, 2, 2, 4,  40, 2, 159.99),
  (5, 3, 6, 12, 40, 4,  99.99),
  (6, 3, 1, 2,  43, 1, 129.99),
  (7, 4, 6, 12, 40, 2,  99.99),
  (8, 4, 8, 16, 39, 2, 100.00);

-- ---------------------------------------------------------------------
-- 4. REMISE À NIVEAU DES COMPTEURS D'ID
-- ---------------------------------------------------------------------
select setval(pg_get_serial_sequence('public.shoes',       'id'), (select max(id) from public.shoes));
select setval(pg_get_serial_sequence('public.shoe_colors',  'id'), (select max(id) from public.shoe_colors));
select setval(pg_get_serial_sequence('public.shoe_sizes',   'id'), (select max(id) from public.shoe_sizes));
select setval(pg_get_serial_sequence('public.carts',        'id'), (select max(id) from public.carts));
select setval(pg_get_serial_sequence('public.cart_items',   'id'), (select max(id) from public.cart_items));
select setval(pg_get_serial_sequence('public.orders',       'id'), (select max(id) from public.orders));
select setval(pg_get_serial_sequence('public.order_items',  'id'), (select max(id) from public.order_items));
