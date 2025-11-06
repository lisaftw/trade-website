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
import { MongoClient, ObjectId } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI!

export const removeItemCommand = {
  data: new SlashCommandBuilder().setName("removeitem").setDescription("Remove an item from the database"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true })

    try {
      const client = new MongoClient(MONGODB_URI)
      await client.connect()

      const db = client.db("trading-db")
      const collection = db.collection("items")

      const games = await collection.distinct("game")

      await client.close()

      if (games.length === 0) {
        await interaction.editReply("❌ No games found in the database!")
        return
      }

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("removeitem_game")
        .setPlaceholder("Select a game")
        .addOptions(
          games.map((game) => ({
            label: game,
            value: game,
          })),
        )

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
        const client = new MongoClient(MONGODB_URI)
        await client.connect()

        const db = client.db("trading-db")
        const collection = db.collection("items")

        const items = await collection.find({ game: selectedGame }).limit(25).toArray()

        await client.close()

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
              label: item.name.substring(0, 100),
              value: item._id.toString(),
              description: `Value: ${item.value} | Section: ${item.section || "N/A"}`,
            })),
          )

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

        await interaction.editReply({
          content: `📋 Select an item from **${selectedGame}** to remove:`,
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

      try {
        const client = new MongoClient(MONGODB_URI)
        await client.connect()

        const db = client.db("trading-db")
        const collection = db.collection("items")

        const item = await collection.findOne({ _id: new ObjectId(itemId) })

        await client.close()

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
          .setCustomId(`removeitem_cancel`)
          .setLabel("❌ Cancel")
          .setStyle(ButtonStyle.Secondary)

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, cancelButton)

        await interaction.editReply({
          content:
            `⚠️ Are you sure you want to delete **${item.name}**?\n\n` +
            `📊 Value: ${item.value}\n` +
            `📁 Section: ${item.section || "N/A"}\n` +
            `🎮 Game: ${item.game}\n\n` +
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
    const [command, action, itemId] = interaction.customId.split("_")

    if (action === "cancel") {
      await interaction.update({
        content: "❌ Deletion cancelled.",
        components: [],
      })
      return
    }

    if (action === "confirm") {
      await interaction.deferUpdate()

      try {
        const client = new MongoClient(MONGODB_URI)
        await client.connect()

        const db = client.db("trading-db")
        const collection = db.collection("items")

        const item = await collection.findOne({ _id: new ObjectId(itemId) })
        const result = await collection.deleteOne({ _id: new ObjectId(itemId) })

        await client.close()

        if (result.deletedCount > 0) {
          await interaction.editReply({
            content: `✅ Successfully deleted **${item?.name || "item"}**!`,
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
          content: "❌ Failed to delete item. Please try again.",
          components: [],
        })
      }
    }
  },
}
