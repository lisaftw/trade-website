-- Delete all MM2 items from the database
DELETE FROM items WHERE game = 'MM2';

-- Verify deletion
SELECT COUNT(*) as mm2_items_remaining FROM items WHERE game = 'MM2';
