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
import { ObjectId } from "mongodb"
import { getItemsCollection } from "../lib/mongodb.js"
import { GAME_CHOICES, type BotCommand } from "../lib/types.js"

export const removeItemCommand: BotCommand = {
  data: new SlashCommandBuilder().setName("removeitem").setDescription("Remove an item from the database"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: 64 })

    try {
      const collection = await getItemsCollection()

      // Get all games that have items
      const games = await collection.distinct("game")

      if (games.length === 0) {
        await interaction.editReply("❌ No items found in the database!")
        return
      }

      // Create game selection dropdown
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("removeitem_game")
        .setPlaceholder("Select a game")
        .addOptions(
          games.map((game) => ({
            label: GAME_CHOICES.find((g) => g.value === game)?.name || game,
            value: game,
          })),
        )

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

      await interaction.editReply({
        content: "Select the game to remove items from:",
        components: [row],
      })
    } catch (error) {
      console.error("Error in removeitem command:", error)
      await interaction.editReply("❌ Failed to load games. Please try again.")
    }
  },

  async handleSelectMenu(interaction: StringSelectMenuInteraction) {
    const [command, action] = interaction.customId.split("_")

    if (action === "game") {
      // User selected a game, now show items from that game
      await interaction.deferUpdate()

      const selectedGame = interaction.values[0]

      try {
        const collection = await getItemsCollection()
        const items = await collection.find({ game: selectedGame }).limit(25).toArray()

        if (items.length === 0) {
          await interaction.editReply({
            content: `❌ No items found for ${selectedGame}!`,
            components: [],
          })
          return
        }

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId("removeitem_item")
          .setPlaceholder("Select an item to remove")
          .addOptions(
            items.map((item) => ({
              label: `${item.name} (${item.section})`,
              description: `Value: ${item.value}`,
              value: item._id.toString(),
            })),
          )

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

        await interaction.editReply({
          content: `Select an item from **${selectedGame}** to remove:`,
          components: [row],
        })
      } catch (error) {
        console.error("Error loading items:", error)
        await interaction.editReply({
          content: "❌ Failed to load items. Please try again.",
          components: [],
        })
      }
    } else if (action === "item") {
      // User selected an item, show confirmation
      await interaction.deferUpdate()

      const itemId = interaction.values[0]

      try {
        const collection = await getItemsCollection()
        const item = await collection.findOne({ _id: new ObjectId(itemId) })

        if (!item) {
          await interaction.editReply({
            content: "❌ Item not found!",
            components: [],
          })
          return
        }

        const confirmButton = new ButtonBuilder()
          .setCustomId(`removeitem_confirm_${itemId}`)
          .setLabel("✅ Confirm Delete")
          .setStyle(ButtonStyle.Danger)

        const cancelButton = new ButtonBuilder()
          .setCustomId(`removeitem_cancel_${itemId}`)
          .setLabel("❌ Cancel")
          .setStyle(ButtonStyle.Secondary)

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, cancelButton)

        await interaction.editReply({
          content: `⚠️ Are you sure you want to delete **${item.name}** from ${item.game}?\n\nThis action cannot be undone!`,
          components: [row],
        })
      } catch (error) {
        console.error("Error loading item:", error)
        await interaction.editReply({
          content: "❌ Failed to load item. Please try again.",
          components: [],
        })
      }
    }
  },

  async handleButton(interaction: ButtonInteraction) {
    const [command, action, itemId] = interaction.customId.split("_")

    if (action === "confirm") {
      await interaction.deferUpdate()

      try {
        const collection = await getItemsCollection()
        const item = await collection.findOne({ _id: new ObjectId(itemId) })

        if (!item) {
          await interaction.editReply({
            content: "❌ Item not found!",
            components: [],
          })
          return
        }

        await collection.deleteOne({ _id: new ObjectId(itemId) })

        await interaction.editReply({
          content: `✅ Successfully deleted **${item.name}** from ${item.game}!`,
          components: [],
        })
      } catch (error) {
        console.error("Error deleting item:", error)
        await interaction.editReply({
          content: "❌ Failed to delete item. Please try again.",
          components: [],
        })
      }
    } else if (action === "cancel") {
      await interaction.update({
        content: "❌ Deletion cancelled.",
        components: [],
      })
    }
  },
}
