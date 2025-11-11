import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js"
import { sql } from "../lib/database.js"
import { GAME_CHOICES, type BotCommand } from "../lib/types.js"

export const addItemCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("additem")
    .setDescription("Add a new item to the database")
    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription("Select the game")
        .setRequired(true)
        .addChoices(...GAME_CHOICES),
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
    await interaction.deferReply({ flags: 64 })

    const game = interaction.options.getString("game", true)
    const name = interaction.options.getString("name", true)
    const section = interaction.options.getString("section", true)
    const value = interaction.options.getNumber("value", true)
    const image = interaction.options.getString("image", true)
    const rarity = interaction.options.getString("rarity")
    const demand = interaction.options.getString("demand")
    const pot = interaction.options.getString("pot")

    if (!image || image.trim() === "") {
      await interaction.editReply("❌ Image URL is required!")
      return
    }

    try {
      new URL(image)
    } catch {
      await interaction.editReply(
        "❌ Invalid image URL format! Please provide a valid URL (e.g., https://example.com/image.png)",
      )
      return
    }

    // Validate game-specific fields
    if ((game === "MM2" || game === "SAB" || game === "GAG") && !rarity) {
      await interaction.editReply("❌ Rarity is required for this game!")
      return
    }

    if ((game === "MM2" || game === "SAB" || game === "GAG" || game === "Adopt Me") && !demand) {
      await interaction.editReply("❌ Demand is required for this game!")
      return
    }

    if (game === "Adopt Me" && !pot) {
      await interaction.editReply("❌ Pot (potion type) is required for Adopt Me!")
      return
    }

    try {
      const now = new Date().toISOString()

      const result = await sql`
        INSERT INTO items (
          name, 
          section, 
          rap_value, 
          image_url, 
          game, 
          rarity, 
          demand, 
          pot,
          created_at,
          updated_at,
          last_updated_at
        )
        VALUES (
          ${name},
          ${section},
          ${value},
          ${image.trim()},
          ${game},
          ${rarity || null},
          ${demand || null},
          ${pot || null},
          ${now},
          ${now},
          ${now}
        )
        RETURNING id
      `

      let fieldsSummary = `📊 Value: ${value}\n📁 Section: ${section}\n🖼️ Image: ${image.substring(0, 50)}...`
      if (rarity) fieldsSummary += `\n✨ Rarity: ${rarity}`
      if (demand) fieldsSummary += `\n📈 Demand: ${demand}`
      if (pot) fieldsSummary += `\n🧪 Pot: ${pot}`

      await interaction.editReply(
        `✅ Successfully added **${name}** to ${game}!\n${fieldsSummary}\n🆔 ID: ${result[0].id}`,
      )
    } catch (error) {
      console.error("[v0] Error adding item:", error)
      await interaction.editReply("❌ Failed to add item to database. Please try again.")
    }
  },
}
