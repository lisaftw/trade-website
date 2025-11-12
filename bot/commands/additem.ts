import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js"
import { supabase } from "../lib/supabase"

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
        ),
    )
    .addStringOption((option) => option.setName("name").setDescription("Item name").setRequired(true))
    .addStringOption((option) => option.setName("section").setDescription("Item section/category").setRequired(true))
    .addNumberOption((option) => option.setName("value").setDescription("Item value").setRequired(true))
    .addStringOption((option) => option.setName("image").setDescription("Image URL").setRequired(true))
    .addNumberOption((option) => option.setName("rating").setDescription("Item rating (0-5)").setRequired(false)),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true })

    const game = interaction.options.getString("game", true)
    const name = interaction.options.getString("name", true)
    const section = interaction.options.getString("section", true)
    const value = interaction.options.getNumber("value", true)
    const image = interaction.options.getString("image", true)
    const rating = interaction.options.getNumber("rating") || 0

    try {
      const result = await supabase
        .from("items")
        .insert({
          name,
          game,
          section,
          rap_value: value,
          image_url: image,
          rating,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (result.error) {
        throw result.error
      }

      await interaction.editReply(
        `✅ Successfully added **${name}** to ${game.toUpperCase()}!\n` +
          `📊 Value: ${value}\n` +
          `📁 Section: ${section}\n` +
          `🆔 ID: ${result.data?.[0]?.id}`,
      )
    } catch (error) {
      console.error("Error adding item:", error)
      await interaction.editReply(
        `❌ Failed to add item to database: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  },
}
