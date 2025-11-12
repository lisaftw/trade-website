import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js"
import { supabase } from "../lib/supabase"

export const removeItemCommand = {
  data: new SlashCommandBuilder()
    .setName("removeitem")
    .setDescription("Remove an item from the database")
    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription("Select the game")
        .setRequired(true)
        .addChoices(
          { name: "Murder Mystery 2", value: "MM2" },
          { name: "Steal a Brain Rot", value: "SAB" },
          { name: "Adopt Me", value: "Adopt Me" },
        ),
    )
    .addStringOption((option) =>
      option
        .setName("item")
        .setDescription("Search for item by name (type at least 2 characters)")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  async autocomplete(interaction: any) {
    const focusedOption = interaction.options.getFocused(true)

    if (focusedOption.name === "item") {
      const game = interaction.options.getString("game")
      const searchTerm = focusedOption.value.toLowerCase().trim()

      if (!game) {
        await interaction.respond([{ name: "Please select a game first", value: "none" }])
        return
      }

      if (searchTerm.length < 2) {
        await interaction.respond([{ name: "Type at least 2 characters to search...", value: "none" }])
        return
      }

      try {
        const result = await supabase
          .from("items")
          .select("id, name, section, rap_value")
          .eq("game", game)
          .ilike("name", `%${searchTerm}%`)
          .order("rap_value", { ascending: false })
          .limit(25)

        if (result.error) throw result.error

        if (!result.data || result.data.length === 0) {
          await interaction.respond([{ name: `No items found matching "${searchTerm}"`, value: "none" }])
          return
        }

        const choices =
          result.data?.map((item: any) => ({
            name: `${item.name} (${item.rap_value || 0} - ${item.section || "Unknown"})`.substring(0, 100),
            value: item.id,
          })) || []

        await interaction.respond(choices)
      } catch (error) {
        console.error("Error in autocomplete:", error)
        await interaction.respond([{ name: "Error during search", value: "error" }])
      }
    }
  },

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true })

    const game = interaction.options.getString("game", true)
    const itemId = interaction.options.getString("item", true)

    if (itemId === "none" || itemId === "error") {
      await interaction.editReply("❌ Please select a valid item from the search results.")
      return
    }

    try {
      const result = await supabase.from("items").select("*").eq("id", itemId).single()

      if (result.error) throw result.error

      if (!result.data) {
        await interaction.editReply("❌ Item not found!")
        return
      }

      const itemData = result.data

      const confirmButton = new ButtonBuilder()
        .setCustomId(`removeitem_confirm_${game}_${itemId}`)
        .setLabel("✅ Confirm Delete")
        .setStyle(ButtonStyle.Danger)

      const cancelButton = new ButtonBuilder()
        .setCustomId(`removeitem_cancel`)
        .setLabel("❌ Cancel")
        .setStyle(ButtonStyle.Secondary)

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, cancelButton)

      await interaction.editReply({
        content:
          `⚠️ Are you sure you want to delete **${itemData.name}**?\n\n` +
          `📊 Value: ${itemData.rap_value}\n` +
          `📁 Section: ${itemData.section || "N/A"}\n` +
          `🎮 Game: ${game}\n\n` +
          `**This action cannot be undone!**`,
        components: [row],
      })
    } catch (error) {
      console.error("Error loading item:", error)
      await interaction.editReply("❌ Failed to load item details.")
    }
  },

  async handleButton(interaction: ButtonInteraction) {
    const parts = interaction.customId.split("_")
    const [command, action] = parts

    if (action === "cancel") {
      await interaction.update({
        content: "❌ Deletion cancelled.",
        components: [],
      })
      return
    }

    if (action === "confirm") {
      await interaction.deferUpdate()

      const selectedGame = parts[2]
      const itemId = parts[3]

      try {
        const getResult = await supabase.from("items").select("name").eq("id", itemId).single()
        const itemName = getResult.data?.name || "item"

        const deleteResult = await supabase.from("items").delete().eq("id", itemId)

        if (deleteResult.error) {
          throw deleteResult.error
        }

        await interaction.editReply({
          content: `✅ Successfully deleted **${itemName}**!`,
          components: [],
        })
      } catch (error) {
        console.error("Error deleting item:", error)
        await interaction.editReply({
          content: `❌ Failed to delete item: ${error instanceof Error ? error.message : "Unknown error"}`,
          components: [],
        })
      }
    }
  },
}
