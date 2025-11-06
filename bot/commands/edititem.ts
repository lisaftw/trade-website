import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type StringSelectMenuInteraction,
  type ModalSubmitInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js"
import { MongoClient, ObjectId } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI!

export const editItemCommand = {
  data: new SlashCommandBuilder().setName("edititem").setDescription("Edit an existing item in the database"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true })

    try {
      const client = new MongoClient(MONGODB_URI)
      await client.connect()

      const db = client.db("trading-db")
      const collection = db.collection("items")

      // Get all games
      const games = await collection.distinct("game")

      await client.close()

      if (games.length === 0) {
        await interaction.editReply("❌ No games found in the database!")
        return
      }

      // Create game selection dropdown
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("edititem_game")
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
      console.error("Error in edititem command:", error)
      await interaction.editReply("❌ Failed to load games. Please try again.")
    }
  },

  async handleSelectMenu(interaction: StringSelectMenuInteraction) {
    const [command, type] = interaction.customId.split("_")

    if (type === "game") {
      // User selected a game, show items
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
          .setCustomId("edititem_item")
          .setPlaceholder("Select an item to edit")
          .addOptions(
            items.map((item) => ({
              label: item.name.substring(0, 100),
              value: item._id.toString(),
              description: `Value: ${item.value} | Section: ${item.section || "N/A"}`,
            })),
          )

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

        await interaction.editReply({
          content: `📋 Select an item from **${selectedGame}** to edit:`,
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
      // User selected an item, show edit modal
      const itemId = interaction.values[0]

      try {
        const client = new MongoClient(MONGODB_URI)
        await client.connect()

        const db = client.db("trading-db")
        const collection = db.collection("items")

        const item = await collection.findOne({ _id: new ObjectId(itemId) })

        await client.close()

        if (!item) {
          await interaction.reply({ content: "❌ Item not found!", ephemeral: true })
          return
        }

        // Create modal with current values
        const modal = new ModalBuilder().setCustomId(`edititem_modal_${itemId}`).setTitle(`Edit: ${item.name}`)

        const nameInput = new TextInputBuilder()
          .setCustomId("name")
          .setLabel("Name")
          .setStyle(TextInputStyle.Short)
          .setValue(item.name)
          .setRequired(true)

        const sectionInput = new TextInputBuilder()
          .setCustomId("section")
          .setLabel("Section")
          .setStyle(TextInputStyle.Short)
          .setValue(item.section || "")
          .setRequired(true)

        const valueInput = new TextInputBuilder()
          .setCustomId("value")
          .setLabel("Value")
          .setStyle(TextInputStyle.Short)
          .setValue(item.value.toString())
          .setRequired(true)

        const imageInput = new TextInputBuilder()
          .setCustomId("image")
          .setLabel("Image URL")
          .setStyle(TextInputStyle.Short)
          .setValue(item.image_url || "")
          .setRequired(false)

        const extraInput = new TextInputBuilder()
          .setCustomId("extra")
          .setLabel("Rarity/Demand/Pot (format: rarity:value,demand:value)")
          .setStyle(TextInputStyle.Short)
          .setValue(
            [
              item.rarity ? `rarity:${item.rarity}` : "",
              item.demand ? `demand:${item.demand}` : "",
              item.pot ? `pot:${item.pot}` : "",
            ]
              .filter(Boolean)
              .join(","),
          )
          .setRequired(false)

        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(sectionInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(valueInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(extraInput),
        )

        await interaction.showModal(modal)
      } catch (error) {
        console.error("Error showing edit modal:", error)
        await interaction.reply({ content: "❌ Failed to load item details.", ephemeral: true })
      }
    }
  },

  async handleModal(interaction: ModalSubmitInteraction) {
    await interaction.deferReply({ ephemeral: true })

    const itemId = interaction.customId.split("_")[2]
    const name = interaction.fields.getTextInputValue("name")
    const section = interaction.fields.getTextInputValue("section")
    const value = Number.parseFloat(interaction.fields.getTextInputValue("value"))
    const image = interaction.fields.getTextInputValue("image")
    const extraFields = interaction.fields.getTextInputValue("extra")

    if (isNaN(value)) {
      await interaction.editReply("❌ Invalid value! Please enter a number.")
      return
    }

    try {
      const client = new MongoClient(MONGODB_URI)
      await client.connect()

      const db = client.db("trading-db")
      const collection = db.collection("items")

      const updates: any = {
        name,
        section,
        value,
        updatedAt: new Date(),
      }

      if (image) {
        updates.image_url = image
      }

      // Parse extra fields
      if (extraFields) {
        const pairs = extraFields.split(",")
        pairs.forEach((pair) => {
          const [key, val] = pair.split(":").map((s) => s.trim())
          if (key && val) {
            updates[key] = val
          }
        })
      }

      const result = await collection.updateOne({ _id: new ObjectId(itemId) }, { $set: updates })

      await client.close()

      if (result.modifiedCount > 0) {
        await interaction.editReply(`✅ Successfully updated **${name}**!`)
      } else {
        await interaction.editReply("⚠️ No changes were made.")
      }
    } catch (error) {
      console.error("Error updating item:", error)
      await interaction.editReply("❌ Failed to update item. Please try again.")
    }
  },
}
