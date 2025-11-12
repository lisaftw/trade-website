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
import { supabase } from "../lib/supabase"

export const editItemCommand = {
  data: new SlashCommandBuilder().setName("edititem").setDescription("Edit an existing item in the database"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true })

    try {
      const games = ["mm2", "sab", "adoptme"]

      if (games.length === 0) {
        await interaction.editReply("❌ No games found in the database!")
        return
      }

      // Create game selection dropdown
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("edititem_game")
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
          .setCustomId(`edititem_item_${selectedGame}`)
          .setPlaceholder("Select an item to edit")
          .addOptions(
            result.data.map((item: any) => ({
              label: item.name.substring(0, 100),
              value: item.id,
              description: `Value: ${item.rap_value} | Section: ${item.section || "N/A"}`,
            })),
          )

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

        await interaction.editReply({
          content: `📋 Select an item from **${selectedGame.toUpperCase()}** to edit:`,
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
      const selectedGame = interaction.customId.split("_")[2]

      try {
        const result = await supabase.from("items").select("*").eq("id", itemId).single()

        if (result.error) throw result.error

        if (!result.data) {
          await interaction.reply({ content: "❌ Item not found!", ephemeral: true })
          return
        }

        const itemData = result.data

        // Create modal with current values
        const modal = new ModalBuilder()
          .setCustomId(`edititem_modal_${selectedGame}_${itemId}`)
          .setTitle(`Edit: ${itemData.name}`)

        const nameInput = new TextInputBuilder()
          .setCustomId("name")
          .setLabel("Name")
          .setStyle(TextInputStyle.Short)
          .setValue(itemData.name)
          .setRequired(true)

        const sectionInput = new TextInputBuilder()
          .setCustomId("section")
          .setLabel("Section")
          .setStyle(TextInputStyle.Short)
          .setValue(itemData.section || "")
          .setRequired(true)

        const valueInput = new TextInputBuilder()
          .setCustomId("value")
          .setLabel("Value")
          .setStyle(TextInputStyle.Short)
          .setValue(itemData.rap_value?.toString() || "0")
          .setRequired(true)

        const imageInput = new TextInputBuilder()
          .setCustomId("image")
          .setLabel("Image URL")
          .setStyle(TextInputStyle.Short)
          .setValue(itemData.image_url || "")
          .setRequired(false)

        const ratingInput = new TextInputBuilder()
          .setCustomId("rating")
          .setLabel("Rating (0-5)")
          .setStyle(TextInputStyle.Short)
          .setValue(itemData.rating?.toString() || "0")
          .setRequired(false)

        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(sectionInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(valueInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(ratingInput),
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

    const [command, modal, selectedGame, itemId] = interaction.customId.split("_")
    const name = interaction.fields.getTextInputValue("name")
    const section = interaction.fields.getTextInputValue("section")
    const value = Number.parseFloat(interaction.fields.getTextInputValue("value"))
    const image = interaction.fields.getTextInputValue("image")
    const rating = Number.parseFloat(interaction.fields.getTextInputValue("rating")) || 0

    if (isNaN(value)) {
      await interaction.editReply("❌ Invalid value! Please enter a number.")
      return
    }

    try {
      const result = await supabase
        .from("items")
        .update({
          name,
          section,
          rap_value: value,
          image_url: image || null,
          rating,
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId)

      if (result.error) {
        throw result.error
      }

      await interaction.editReply(`✅ Successfully updated **${name}**!`)
    } catch (error) {
      console.error("Error updating item:", error)
      await interaction.editReply(
        `❌ Failed to update item: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  },
}
