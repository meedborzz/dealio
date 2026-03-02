@@ .. @@
             -- Generate time slots for this deal
             FOR slot_date IN 
                 SELECT generate_series(
                     CURRENT_DATE,
                     CURRENT_DATE + INTERVAL '21 days',
                     INTERVAL '1 day'
                 )::date
             LOOP
                 -- Skip Sundays
                 IF EXTRACT(DOW FROM slot_date) != 0 THEN
                     -- Create morning slots
                     FOR slot_time IN 
                         SELECT unnest(ARRAY['09:00'::time, '09:30'::time, '10:00'::time, '10:30'::time, '11:00'::time, '11:30'::time])
                     LOOP
                         INSERT INTO time_slots (
                             deal_id,
-                            slot_date,
-                            slot_time,
+                            date,
+                            start_time,
+                            end_time,
                             available_spots
                         ) VALUES (
                             current_deal_id,
                             slot_date,
                             slot_time,
+                            slot_time + (current_duration || ' minutes')::interval,
                             current_max_bookings
                         );
                     END LOOP;
                     
                     -- Create afternoon slots
                     FOR slot_time IN 
                         SELECT unnest(ARRAY['14:00'::time, '14:30'::time, '15:00'::time, '15:30'::time, '16:00'::time, '16:30'::time])
                     LOOP
                         INSERT INTO time_slots (
                             deal_id,
-                            slot_date,
-                            slot_time,
+                            date,
+                            start_time,
+                            end_time,
                             available_spots
                         ) VALUES (
                             current_deal_id,
                             slot_date,
                             slot_time,
+                            slot_time + (current_duration || ' minutes')::interval,
                             current_max_bookings
                         );
                     END LOOP;