import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js"
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI!

export const addItemCommand = {
  data: new SlashCommandBuilder()
    .setName("additem")
    .setDescription("Add a new item to the database")
    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription("Select the game")
        .setRequired(true)
        .addChoices(
          { name: "Murder Mystery 2", value: "MM2" },
          { name: "Adopt Me", value: "Adopt Me" },
          { name: "Steal a Brain Rot", value: "SAB" },
          { name: "Grow a Garden", value: "GAG" },
        ),
    )
    .addStringOption((option) => option.setName("name").setDescription("Item name").setRequired(true))
    .addStringOption((option) => option.setName("section").setDescription("Item section/category").setRequired(true))
    .addNumberOption((option) => option.setName("value").setDescription("Item value").setRequired(true))
    .addStringOption((option) => option.setName("image").setDescription("Image URL").setRequired(true))
    .addStringOption((option) =>
      option.setName("rarity").setDescription("Item rarity (for MM2, SAB, GAG)").setRequired(false),
    )
    .addStringOption((option) =>
      option.setName("demand").setDescription("Item demand (for MM2, SAB, GAG, Adopt Me)").setRequired(false),
    )
    .addStringOption((option) =>
      option.setName("pot").setDescription("Potion type (for Adopt Me only)").setRequired(false),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true })

    const game = interaction.options.getString("game", true)
    const name = interaction.options.getString("name", true)
    const section = interaction.options.getString("section", true)
    const value = interaction.options.getNumber("value", true)
    const image = interaction.options.getString("image", true)
    const rarity = interaction.options.getString("rarity")
    const demand = interaction.options.getString("demand")
    const pot = interaction.options.getString("pot")

    // Validate game-specific fields
    if ((game === "MM2" || game === "SAB" || game === "GAG") && !rarity) {
      await interaction.editReply("❌ Rarity is required for this game!")
      return
    }

    if (game === "Adopt Me" && !pot) {
      await interaction.editReply("❌ Pot (potion type) is required for Adopt Me!")
      return
    }

    try {
      const client = new MongoClient(MONGODB_URI)
      await client.connect()

      const db = client.db("trading-db")
      const collection = db.collection("items")

      // Build item object based on game
      const item: any = {
        name,
        section,
        value,
        image_url: image,
        game,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Add game-specific fields
      if (game === "MM2" || game === "SAB" || game === "GAG") {
        item.rarity = rarity
        item.demand = demand || "Unknown"
      } else if (game === "Adopt Me") {
        item.demand = demand || "Unknown"
        item.pot = pot
      }

      const result = await collection.insertOne(item)

      await client.close()

      await interaction.editReply(
        `✅ Successfully added **${name}** to ${game}!\n` +
          `📊 Value: ${value}\n` +
          `📁 Section: ${section}\n` +
          `🆔 ID: ${result.insertedId}`,
      )
    } catch (error) {
      console.error("Error adding item:", error)
      await interaction.editReply("❌ Failed to add item to database. Please try again.")
    }
  },
}
