-- MongoDB seed data (run this in MongoDB Compass or mongosh)
-- Database: trade
-- Collection: items

-- MM2 Items
db.items.insertMany([
  {
    name: "Chroma Lightbringer",
    value: 15000,
    game: "MM2",
    imageUrl: "/ornate-dagger.png",
    rarity: "Chroma",
    category: "Knife",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Harvester",
    value: 12000,
    game: "MM2",
    imageUrl: "/scythe.jpg",
    rarity: "Ancient",
    category: "Knife",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Icebreaker",
    value: 8500,
    game: "MM2",
    imageUrl: "/abstract-geometric-sculpture.png",
    rarity: "Legendary",
    category: "Knife",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Batwing",
    value: 7200,
    game: "MM2",
    rarity: "Ancient",
    category: "Knife",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Elderwood Scythe",
    value: 6800,
    game: "MM2",
    rarity: "Ancient",
    category: "Knife",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

-- SAB Items
db.items.insertMany([
  {
    name: "Rainbow Blade",
    value: 9500,
    game: "SAB",
    rarity: "Mythical",
    category: "Sword",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Dark Matter Sword",
    value: 11000,
    game: "SAB",
    rarity: "Exotic",
    category: "Sword",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

-- Adopt Me Items
db.items.insertMany([
  {
    name: "Neon Frost Dragon",
    value: 25000,
    game: "Adopt Me",
    rarity: "Legendary",
    category: "Pet",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Shadow Dragon",
    value: 32000,
    game: "Adopt Me",
    rarity: "Legendary",
    category: "Pet",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
