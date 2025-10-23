-- Drop the foreign key constraint on user_inventories
alter table user_inventories drop constraint if exists fk_item;
alter table user_inventories drop constraint if exists user_inventories_item_id_fkey;

-- Change item_id from UUID to TEXT to support MongoDB ObjectId strings
alter table user_inventories alter column item_id type text using item_id::text;

-- Recreate the index
drop index if exists idx_user_inventories_item_id;
create index idx_user_inventories_item_id on user_inventories(item_id);
