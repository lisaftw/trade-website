-- Seed sample items for each game
-- MM2 (Murder Mystery 2)
INSERT INTO public.items (game, name, image_url, rap_value, exist_count, change_percent, rating) VALUES
('MM2', 'Nik''s Scythe', '/placeholder.svg?height=200&width=200', 150000.00, 12, 5.2, 9.8),
('MM2', 'Batwing', '/placeholder.svg?height=200&width=200', 85000.00, 45, -2.1, 9.5),
('MM2', 'Chroma Lightbringer', '/placeholder.svg?height=200&width=200', 120000.00, 28, 3.7, 9.7),
('MM2', 'Elderwood Scythe', '/placeholder.svg?height=200&width=200', 95000.00, 67, 1.2, 9.3),
('MM2', 'Ice Dragon', '/placeholder.svg?height=200&width=200', 78000.00, 89, -0.8, 9.1),
('MM2', 'Candy', '/placeholder.svg?height=200&width=200', 42000.00, 156, 2.3, 8.9),
('MM2', 'Fang', '/placeholder.svg?height=200&width=200', 38000.00, 203, -1.5, 8.7),
('MM2', 'Luger', '/placeholder.svg?height=200&width=200', 55000.00, 134, 0.9, 9.0);

-- SAB (Sword Art Burst)
INSERT INTO public.items (game, name, image_url, rap_value, exist_count, change_percent, rating) VALUES
('SAB', 'Dark Repulser', '/placeholder.svg?height=200&width=200', 65000.00, 34, 4.1, 9.4),
('SAB', 'Elucidator', '/placeholder.svg?height=200&width=200', 72000.00, 28, 2.8, 9.6),
('SAB', 'Lambent Light', '/placeholder.svg?height=200&width=200', 58000.00, 45, -1.2, 9.2),
('SAB', 'Blue Rose Sword', '/placeholder.svg?height=200&width=200', 89000.00, 19, 6.3, 9.7),
('SAB', 'Night Sky Sword', '/placeholder.svg?height=200&width=200', 95000.00, 15, 8.1, 9.8),
('SAB', 'Fragrant Olive Sword', '/placeholder.svg?height=200&width=200', 48000.00, 67, 1.5, 8.9);

-- GAG (Guess a Game)
INSERT INTO public.items (game, name, image_url, rap_value, exist_count, change_percent, rating) VALUES
('GAG', 'Legendary Trophy', '/placeholder.svg?height=200&width=200', 125000.00, 8, 12.5, 9.9),
('GAG', 'Rainbow Badge', '/placeholder.svg?height=200&width=200', 78000.00, 23, 5.7, 9.5),
('GAG', 'Diamond Crown', '/placeholder.svg?height=200&width=200', 98000.00, 14, 7.2, 9.7),
('GAG', 'Golden Ticket', '/placeholder.svg?height=200&width=200', 56000.00, 45, 2.1, 9.1),
('GAG', 'Platinum Medal', '/placeholder.svg?height=200&width=200', 67000.00, 34, 3.4, 9.3),
('GAG', 'Crystal Star', '/placeholder.svg?height=200&width=200', 43000.00, 78, -0.5, 8.8);

-- Adopt Me
INSERT INTO public.items (game, name, image_url, rap_value, exist_count, change_percent, rating) VALUES
('Adopt Me', 'Shadow Dragon', '/placeholder.svg?height=200&width=200', 185000.00, 6, 15.3, 10.0),
('Adopt Me', 'Bat Dragon', '/placeholder.svg?height=200&width=200', 165000.00, 9, 11.2, 9.9),
('Adopt Me', 'Giraffe', '/placeholder.svg?height=200&width=200', 142000.00, 12, 8.7, 9.8),
('Adopt Me', 'Frost Dragon', '/placeholder.svg?height=200&width=200', 128000.00, 18, 6.4, 9.7),
('Adopt Me', 'Owl', '/placeholder.svg?height=200&width=200', 95000.00, 34, 4.2, 9.5),
('Adopt Me', 'Parrot', '/placeholder.svg?height=200&width=200', 87000.00, 45, 3.1, 9.4),
('Adopt Me', 'Evil Unicorn', '/placeholder.svg?height=200&width=200', 76000.00, 56, 2.3, 9.2),
('Adopt Me', 'Crow', '/placeholder.svg?height=200&width=200', 68000.00, 67, 1.8, 9.1);

-- Update timestamps
UPDATE public.items SET last_updated_at = NOW() - (random() * interval '7 days');
