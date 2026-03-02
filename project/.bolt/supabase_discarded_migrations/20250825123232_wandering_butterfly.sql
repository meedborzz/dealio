@@ .. @@
 DO $$
 DECLARE
     business_id_1 UUID;
     business_id_2 UUID;
     business_id_3 UUID;
     business_id_4 UUID;
     business_id_5 UUID;
     deal_id UUID;
     slot_date DATE;
     slot_time TIME;
 BEGIN
     -- Create Business 1: Salon Prestige Casablanca
     INSERT INTO businesses (
         id,
         name,
         description,
         address,
         city,
         category,
         phone,
         email,
         rating,
         review_count,
         owner_id,
-        status,
-        image_url
+        status
     ) VALUES (
         gen_random_uuid(),
         'Salon Prestige Casablanca',
         'Salon de coiffure haut de gamme spécialisé dans les coupes tendance et colorations professionnelles.',
         '123 Boulevard Mohammed V',
         'Casablanca',
         'Coiffure',
         '+212 522 123 456',
         'contact@salon-prestige.ma',
         4.8,
         156,
         '14961e21-7c51-46d4-9832-fbe12aa8b3f9',
-        'approved',
-        'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800'
+        'approved'
     ) ON CONFLICT (owner_id) DO UPDATE SET
         status = 'approved',
         updated_at = NOW()
     RETURNING id INTO business_id_1;
 
     -- Create Business 2: Spa Serenity Rabat
     INSERT INTO businesses (
         id,
         name,
         description,
         address,
         city,
         category,
         phone,
         email,
         rating,
         review_count,
         owner_id,
         status
     ) VALUES (
         gen_random_uuid(),
         'Spa Serenity Rabat',
         'Centre de bien-être proposant massages thérapeutiques et soins du corps dans un cadre zen.',
         '45 Avenue Hassan II',
         'Rabat',
         'Massage',
         '+212 537 654 321',
         'info@spa-serenity.ma',
         4.9,
         203,
         '14961e21-7c51-46d4-9832-fbe12aa8b3f9',
         'approved'
     ) RETURNING id INTO business_id_2;
 
     -- Create Business 3: Beauty Nails Studio
     INSERT INTO businesses (
         id,
         name,
         description,
         address,
         city,
         category,
         phone,
         email,
         rating,
         review_count,
         owner_id,
         status
     ) VALUES (
         gen_random_uuid(),
         'Beauty Nails Studio',
         'Studio spécialisé dans les soins des ongles, nail art créatif et manucure/pédicure professionnelle.',
         '78 Rue de la Liberté',
         'Marrakech',
         'Ongles',
         '+212 524 987 654',
         'contact@beauty-nails.ma',
         4.7,
         142,
         '14961e21-7c51-46d4-9832-fbe12aa8b3f9',
         'approved'
     ) RETURNING id INTO business_id_3;
 
     -- Create Business 4: Esthétique Moderne Fès
     INSERT INTO businesses (
         id,
         name,
         description,
         address,
         city,
         category,
         phone,
         email,
         rating,
         review_count,
         owner_id,
         status
     ) VALUES (
         gen_random_uuid(),
         'Esthétique Moderne Fès',
         'Centre d''esthétique avancée proposant soins du visage, épilation et traitements anti-âge.',
         '56 Boulevard Allal Ben Abdellah',
         'Fès',
         'Esthetique',
         '+212 535 741 852',
         'info@esthetique-moderne.ma',
         4.6,
         98,
         '14961e21-7c51-46d4-9832-fbe12aa8b3f9',
         'approved'
     ) RETURNING id INTO business_id_4;
 
     -- Create Business 5: Studio Maquillage Pro
     INSERT INTO businesses (
         id,
         name,
         description,
         address,
         city,
         category,
         phone,
         email,
         rating,
         review_count,
         owner_id,
         status
     ) VALUES (
         gen_random_uuid(),
         'Studio Maquillage Pro',
         'Studio professionnel de maquillage pour événements spéciaux et formations beauté.',
         '28 Rue Prince Héritier',
         'Casablanca',
         'Manucure',
         '+212 522 741 852',
         'info@maquillage-pro.ma',
         4.8,
         76,
         '14961e21-7c51-46d4-9832-fbe12aa8b3f9',
         'approved'
     ) RETURNING id INTO business_id_5;