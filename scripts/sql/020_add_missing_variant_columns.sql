-- Add missing variant column for Neon Fly (NF)
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS value_nf DECIMAL;

-- Note: value_f column should already exist from previous migrations
