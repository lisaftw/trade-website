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
import { sql } from "@vercel/postgres"

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
        let items
        if (selectedGame === "mm2") {
          items = await sql`SELECT id, name, section, value FROM mm2_items ORDER BY name LIMIT 25`
        } else if (selectedGame === "sab") {
          items = await sql`SELECT id, name, section, value FROM sab_items ORDER BY name LIMIT 25`
        } else if (selectedGame === "adoptme") {
          items = await sql`SELECT id, name, section, value FROM adoptme_items ORDER BY name LIMIT 25`
        }

        if (!items || items.rows.length === 0) {
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
            items.rows.map((item: any) => ({
              label: item.name.substring(0, 100),
              value: item.id,
              description: `Value: ${item.value} | Section: ${item.section || "N/A"}`,
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
        let item
        if (selectedGame === "mm2") {
          item = await sql`SELECT * FROM mm2_items WHERE id = ${itemId}`
        } else if (selectedGame === "sab") {
          item = await sql`SELECT * FROM sab_items WHERE id = ${itemId}`
        } else if (selectedGame === "adoptme") {
          item = await sql`SELECT * FROM adoptme_items WHERE id = ${itemId}`
        }

        if (!item || item.rows.length === 0) {
          await interaction.editReply({
            content: "❌ Item not found!",
            components: [],
          })
          return
        }

        const itemData = item.rows[0]

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
            `📊 Value: ${itemData.value}\n` +
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
        let itemName = ""
        let result

        if (selectedGame === "mm2") {
          const item = await sql`SELECT name FROM mm2_items WHERE id = ${itemId}`
          itemName = item.rows[0]?.name || "item"
          result = await sql`DELETE FROM mm2_items WHERE id = ${itemId}`
        } else if (selectedGame === "sab") {
          const item = await sql`SELECT name FROM sab_items WHERE id = ${itemId}`
          itemName = item.rows[0]?.name || "item"
          result = await sql`DELETE FROM sab_items WHERE id = ${itemId}`
        } else if (selectedGame === "adoptme") {
          const item = await sql`SELECT name FROM adoptme_items WHERE id = ${itemId}`
          itemName = item.rows[0]?.name || "item"
          result = await sql`DELETE FROM adoptme_items WHERE id = ${itemId}`
        }

        if (result && result.rowCount > 0) {
          await interaction.editReply({
            content: `✅ Successfully deleted **${itemName}**!`,
            components: [],
          })
        } else {
          await interaction.editReply({
            content: "❌ Failed to delete item. It may have already been removed.",
            components: [],
          })
        }
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
