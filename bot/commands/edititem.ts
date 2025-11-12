import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type ModalSubmitInteraction,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js"
import { supabase } from "../lib/supabase"

export const editItemCommand = {
  data: new SlashCommandBuilder()
    .setName("edititem")
    .setDescription("Edit an existing item in the database")
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
    const game = interaction.options.getString("game", true)
    const itemId = interaction.options.getString("item", true)

    if (itemId === "none" || itemId === "error") {
      await interaction.reply({ content: "❌ Please select a valid item from the search results.", ephemeral: true })
      return
    }

    try {
      const result = await supabase.from("items").select("*").eq("id", itemId).single()

      if (result.error) throw result.error

      if (!result.data) {
        await interaction.reply({ content: "❌ Item not found!", ephemeral: true })
        return
      }

      const itemData = result.data

      const modal = new ModalBuilder()
        .setCustomId(`edititem_modal_${game}_${itemId}`)
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
      console.error("Error loading item for edit:", error)
      await interaction.reply({
        content: `❌ Failed to load item: ${error instanceof Error ? error.message : "Unknown error"}`,
        ephemeral: true,
      })
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
