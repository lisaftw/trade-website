import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type StringSelectMenuInteraction,
  type ButtonInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js"
import { supabase } from "../lib/supabase"

export const removeItemCommand = {
  data: new SlashCommandBuilder().setName("removeitem").setDescription("Remove an item from the database"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true })

    try {
      const games = ["mm2", "sab", "adoptme"]

      if (games.length === 0) {
        await interaction.editReply("❌ No games found in the database!")
        return
      }

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("removeitem_game")
        .setPlaceholder("Select a game")
        .addOptions([
          { label: "Murder Mystery 2", value: "mm2" },
          { label: "Steal a Brain Rot", value: "sab" },
          { label: "Adopt Me", value: "adoptme" },
        ])

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

      await interaction.editReply({
        content: "📋 Select a game to view its items:",
        components: [row],
      })
    } catch (error) {
      console.error("Error in removeitem command:", error)
      await interaction.editReply("❌ Failed to load games. Please try again.")
    }
  },

  async handleSelectMenu(interaction: StringSelectMenuInteraction) {
    const [command, type] = interaction.customId.split("_")

    if (type === "game") {
      await interaction.deferUpdate()

      const selectedGame = interaction.values[0]

      try {
        const result = await supabase
          .from("items")
          .select("id, name, section, rap_value")
          .eq("game", selectedGame)
          .order("name")
          .limit(25)

        if (result.error) throw result.error

        if (!result.data || result.data.length === 0) {
          await interaction.editReply({
            content: `❌ No items found for ${selectedGame}!`,
            components: [],
          })
          return
        }

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId(`removeitem_item_${selectedGame}`)
          .setPlaceholder("Select an item to remove")
          .addOptions(
            result.data.map((item: any) => ({
              label: item.name.substring(0, 100),
              value: item.id,
              description: `Value: ${item.rap_value} | Section: ${item.section || "N/A"}`,
            })),
          )

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

        await interaction.editReply({
          content: `📋 Select an item from **${selectedGame.toUpperCase()}** to remove:`,
          components: [row],
        })
      } catch (error) {
        console.error("Error loading items:", error)
        await interaction.editReply({
          content: "❌ Failed to load items. Please try again.",
          components: [],
        })
      }
    } else if (type === "item") {
      await interaction.deferUpdate()

      const itemId = interaction.values[0]
      const selectedGame = interaction.customId.split("_")[2]

      try {
        const result = await supabase.from("items").select("*").eq("id", itemId).single()

        if (result.error) throw result.error

        if (!result.data) {
          await interaction.editReply({
            content: "❌ Item not found!",
            components: [],
          })
          return
        }

        const itemData = result.data

        const confirmButton = new ButtonBuilder()
          .setCustomId(`removeitem_confirm_${selectedGame}_${itemId}`)
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
            `🎮 Game: ${selectedGame.toUpperCase()}\n\n` +
            `**This action cannot be undone!**`,
          components: [row],
        })
      } catch (error) {
        console.error("Error loading item:", error)
        await interaction.editReply({
          content: "❌ Failed to load item details.",
          components: [],
        })
      }
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
