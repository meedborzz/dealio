@@ .. @@
-- Function to notify users when a slot becomes available
CREATE OR REPLACE FUNCTION notify_waiting_list_slot_available()
RETURNS TRIGGER AS $$
BEGIN
  -- When a time slot gets more available spots, notify waiting list users
  IF NEW.available_spots > OLD.available_spots THEN
-    -- Update the first waiting entry to 'notified'
-    UPDATE waiting_lists 
-    SET status = 'notified', expires_at = now() + interval '30 minutes'
-    WHERE time_slot_id = NEW.id 
-    AND status = 'waiting'
-    ORDER BY priority DESC, created_at ASC
-    LIMIT 1;
+    -- Update the first waiting entry to 'notified' using a subquery
+    UPDATE waiting_lists 
+    SET status = 'notified', expires_at = now() + interval '30 minutes'
+    WHERE id = (
+      SELECT id FROM waiting_lists
+      WHERE time_slot_id = NEW.id 
+      AND status = 'waiting'
+      ORDER BY priority DESC, created_at ASC
+      LIMIT 1
+    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;