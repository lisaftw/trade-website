-- Create items table in PostgreSQL
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  value DECIMAL(10, 2) DEFAULT 0,
  game VARCHAR(50) NOT NULL,
  section VARCHAR(100),
  image_url TEXT,
  
  -- MM2, SAB, GAG specific fields
  rarity VARCHAR(50),
  demand VARCHAR(50),
  
  -- Adopt Me specific fields
  pot VARCHAR(50),
  
  -- Legacy fields for compatibility
  rap_value DECIMAL(10, 2) DEFAULT 0,
  neon_value DECIMAL(10, 2) DEFAULT 0,
  mega_value DECIMAL(10, 2) DEFAULT 0,
  fly_bonus DECIMAL(10, 2) DEFAULT 50,
  ride_bonus DECIMAL(10, 2) DEFAULT 50,
  exist_count INTEGER DEFAULT 0,
  rating VARCHAR(50),
  change_percent DECIMAL(5, 2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_items_game ON items(game);
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_value ON items(value DESC);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);

-- Create a text search index for item names
CREATE INDEX IF NOT EXISTS idx_items_name_search ON items USING gin(to_tsvector('english', name));
