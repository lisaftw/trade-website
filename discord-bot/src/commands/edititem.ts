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
import { ObjectId } from "mongodb"
import { getItemsCollection } from "../lib/mongodb.js"
import { GAME_CHOICES, type BotCommand } from "../lib/types.js"

export const editItemCommand: BotCommand = {
  data: new SlashCommandBuilder().setName("edititem").setDescription("Edit an existing item in the database"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true })

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
        .setCustomId("edititem_game")
        .setPlaceholder("Select a game")
        .addOptions(
          games.map((game) => ({
            label: GAME_CHOICES.find((g) => g.value === game)?.name || game,
            value: game,
          })),
        )

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

      await interaction.editReply({
        content: "Select the game to edit items from:",
        components: [row],
      })
    } catch (error) {
      console.error("Error in edititem command:", error)
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
          .setCustomId("edititem_item")
          .setPlaceholder("Select an item to edit")
          .addOptions(
            items.map((item) => ({
              label: `${item.name} (${item.section})`,
              description: `Value: ${item.value}`,
              value: item._id.toString(),
            })),
          )

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

        await interaction.editReply({
          content: `Select an item from **${selectedGame}** to edit:`,
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
      // User selected an item, show edit modal
      const itemId = interaction.values[0]

      try {
        const collection = await getItemsCollection()
        const item = await collection.findOne({ _id: new ObjectId(itemId) })

        if (!item) {
          await interaction.reply({
            content: "❌ Item not found!",
            flags: 64, // EPHEMERAL flag
          })
          return
        }

        // Create modal with current values
        const modal = new ModalBuilder()
          .setCustomId(`edititem_modal_${itemId}`)
          .setTitle(`Edit: ${item.name || "Item"}`)

        const nameInput = new TextInputBuilder()
          .setCustomId("name")
          .setLabel("Name")
          .setStyle(TextInputStyle.Short)
          .setValue(item.name || "")
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
          .setValue(item.value?.toString() || "0")
          .setRequired(true)

        const imageInput = new TextInputBuilder()
          .setCustomId("image")
          .setLabel("Image URL")
          .setStyle(TextInputStyle.Short)
          .setValue(item.image_url || "")
          .setRequired(true)

        let extraInput: TextInputBuilder
        if (item.game === "Adopt Me") {
          const potValue = item.pot || ""
          const demandValue = item.demand || ""
          extraInput = new TextInputBuilder()
            .setCustomId("extra")
            .setLabel("Pot | Demand (separated by |)")
            .setStyle(TextInputStyle.Short)
            .setValue(`${potValue} | ${demandValue}`)
            .setRequired(false)
        } else {
          const rarityValue = item.rarity || ""
          const demandValue = item.demand || ""
          extraInput = new TextInputBuilder()
            .setCustomId("extra")
            .setLabel("Rarity | Demand (separated by |)")
            .setStyle(TextInputStyle.Short)
            .setValue(`${rarityValue} | ${demandValue}`)
            .setRequired(false)
        }

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
        await interaction.reply({
          content: "❌ Failed to load item details. Please try again.",
          flags: 64, // EPHEMERAL flag
        })
      }
    }
  },

  async handleModal(interaction: ModalSubmitInteraction) {
    await interaction.deferReply({ flags: 64 })

    const itemId = interaction.customId.split("_")[2]
    const name = interaction.fields.getTextInputValue("name")
    const section = interaction.fields.getTextInputValue("section")
    const value = Number.parseFloat(interaction.fields.getTextInputValue("value"))
    const image = interaction.fields.getTextInputValue("image")
    const extra = interaction.fields.getTextInputValue("extra")

    try {
      const collection = await getItemsCollection()
      const item = await collection.findOne({ _id: new ObjectId(itemId) })

      if (!item) {
        await interaction.editReply("❌ Item not found!")
        return
      }

      // Parse extra field based on game
      const [field1, field2] = extra.split("|").map((s) => s.trim())

      const updateData: any = {
        name,
        section,
        value,
        image_url: image,
        updatedAt: new Date(),
      }

      if (item.game === "Adopt Me") {
        updateData.pot = field1
        updateData.demand = field2
      } else {
        updateData.rarity = field1
        updateData.demand = field2
      }

      await collection.updateOne({ _id: new ObjectId(itemId) }, { $set: updateData })

      await interaction.editReply(`✅ Successfully updated **${name}** in ${item.game}!`)
    } catch (error) {
      console.error("Error updating item:", error)
      await interaction.editReply("❌ Failed to update item. Please try again.")
    }
  },
}
