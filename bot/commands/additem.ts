import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js"
import { sql } from "@vercel/postgres"

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
          { name: "Murder Mystery 2", value: "mm2" },
          { name: "Adopt Me", value: "adoptme" },
          { name: "Steal a Brain Rot", value: "sab" },
        ),
    )
    .addStringOption((option) => option.setName("name").setDescription("Item name").setRequired(true))
    .addStringOption((option) => option.setName("section").setDescription("Item section/category").setRequired(true))
    .addNumberOption((option) => option.setName("value").setDescription("Item value").setRequired(true))
    .addStringOption((option) => option.setName("image").setDescription("Image URL").setRequired(true))
    .addStringOption((option) =>
      option.setName("rarity").setDescription("Item rarity (for MM2, SAB)").setRequired(false),
    )
    .addStringOption((option) =>
      option.setName("demand").setDescription("Item demand (for MM2, SAB, Adopt Me)").setRequired(false),
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
    if ((game === "mm2" || game === "sab") && !rarity) {
      await interaction.editReply("❌ Rarity is required for this game!")
      return
    }

    if (game === "adoptme" && !pot) {
      await interaction.editReply("❌ Pot (potion type) is required for Adopt Me!")
      return
    }

    try {
      let result

      if (game === "mm2") {
        result = await sql`
          INSERT INTO mm2_items (name, section, value, image_url, rarity, demand, created_at, updated_at)
          VALUES (${name}, ${section}, ${value}, ${image}, ${rarity || "Common"}, ${demand || "Unknown"}, NOW(), NOW())
          RETURNING id, name
        `
      } else if (game === "sab") {
        result = await sql`
          INSERT INTO sab_items (name, section, value, image_url, rarity, demand, created_at, updated_at)
          VALUES (${name}, ${section}, ${value}, ${image}, ${rarity || "Common"}, ${demand || "Unknown"}, NOW(), NOW())
          RETURNING id, name
        `
      } else if (game === "adoptme") {
        result = await sql`
          INSERT INTO adoptme_items (name, section, value, image_url, pot, demand, created_at, updated_at)
          VALUES (${name}, ${section}, ${value}, ${image}, ${pot || "Normal"}, ${demand || "Unknown"}, NOW(), NOW())
          RETURNING id, name
        `
      }

      await interaction.editReply(
        `✅ Successfully added **${name}** to ${game.toUpperCase()}!\n` +
          `📊 Value: ${value}\n` +
          `📁 Section: ${section}\n` +
          `🆔 ID: ${result?.rows[0]?.id}`,
      )
    } catch (error) {
      console.error("Error adding item:", error)
      await interaction.editReply(
        `❌ Failed to add item to database: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  },
}
