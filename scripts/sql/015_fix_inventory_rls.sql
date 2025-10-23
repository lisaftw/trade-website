-- Drop existing policies
drop policy if exists "Users can view their own inventory" on user_inventories;
drop policy if exists "Users can insert into their own inventory" on user_inventories;
drop policy if exists "Users can delete from their own inventory" on user_inventories;
drop policy if exists "Users can update their own inventory" on user_inventories;

-- Disable RLS since we're using service role with application-level auth
alter table user_inventories disable row level security;
