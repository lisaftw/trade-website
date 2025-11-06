import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js"
import { getItemsCollection } from "../lib/mongodb.js"
import { GAME_CHOICES, type BotCommand, type GameType } from "../lib/types.js"

export const bulkAddItemCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("bulkadditem")
    .setDescription("Add multiple items at once using a simple format")
    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription("Select the game for all items")
        .setRequired(true)
        .addChoices(...GAME_CHOICES),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const game = interaction.options.getString("game", true) as GameType

    const modal = new ModalBuilder().setCustomId(`bulkadd_${game}`).setTitle(`Bulk Add ${game} Items`)

    let placeholder = ""
    if (game === "Adopt Me") {
      placeholder = "Name | section | value | url | demand | pot"
    } else {
      placeholder = "Name | section | value | url | rarity | demand"
    }

    const itemsInput = new TextInputBuilder()
      .setCustomId("items")
      .setLabel("Items (one per line, | separated)")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder(placeholder)
      .setRequired(true)
      .setMaxLength(4000)

    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(itemsInput)
    modal.addComponents(row)

    await interaction.showModal(modal)
  },

  async handleModal(interaction: any) {
    await interaction.deferReply({ flags: 64 })

    const game = interaction.customId.split("_")[1]
    const itemsText = interaction.fields.getFieldValue("items")

    try {
      const collection = await getItemsCollection()
      const lines = itemsText.split("\n").filter((line: string) => line.trim() !== "")

      const itemsToAdd: any[] = []
      const errors: string[] = []

      console.log(` Bulk adding ${lines.length} items to ${game}`)

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        const parts = line.split("|").map((p: string) => p.trim())

        let requiredFields = 0
        if (game === "MM2" || game === "SAB" || game === "GAG") {
          requiredFields = 6 
        } else if (game === "Adopt Me") {
          requiredFields = 6 
        }

        if (parts.length < requiredFields) {
          errors.push(`Line ${i + 1}: Not enough fields (expected ${requiredFields}, got ${parts.length})`)
          continue
        }

        const [name, section, valueStr, image_url, field1, field2] = parts
        const value = Number.parseFloat(valueStr)

        if (!name || name.trim() === "") {
          errors.push(`Line ${i + 1}: Item name is required`)
          continue
        }

        if (isNaN(value) || value < 0) {
          errors.push(`Line ${i + 1}: Invalid value "${valueStr}" (must be a positive number)`)
          continue
        }

        if (!image_url || image_url.trim() === "") {
          errors.push(`Line ${i + 1}: Image URL is required`)
          continue
        }

        try {
          new URL(image_url)
        } catch {
          errors.push(`Line ${i + 1}: Invalid image URL format`)
          continue
        }

        const item: any = {
          name: name.trim(),
          section: section.trim(),
          value,
          image_url: image_url.trim(),
          game,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        if (game === "MM2" || game === "SAB" || game === "GAG") {
          item.rarity = field1.trim()
          item.demand = field2.trim()
        } else if (game === "Adopt Me") {
          item.demand = field1.trim()
          item.pot = field2.trim()
        }

        itemsToAdd.push(item)
      }

      let successCount = 0
      if (itemsToAdd.length > 0) {
        console.log(` Inserting ${itemsToAdd.length} valid items to MongoDB`)
        console.log(` Sample item:`, JSON.stringify(itemsToAdd[0], null, 2))

        const result = await collection.insertMany(itemsToAdd)
        successCount = result.insertedCount

        console.log(` Successfully inserted ${successCount} items`)
      }

      let response = `✅ Successfully added **${successCount}** items to ${game}!`

      if (errors.length > 0) {
        response += `\n\n⚠️ **${errors.length} errors:**\n${errors.slice(0, 5).join("\n")}`
        if (errors.length > 5) {
          response += `\n... and ${errors.length - 5} more errors`
        }
      }

      if (successCount > 0) {
        response += `\n\n💡 Items will appear on the website within 30 seconds!`
      }

      await interaction.editReply(response)
    } catch (error) {
      console.error(" Error bulk adding items:", error)
      await interaction.editReply("❌ Failed to add items. Please check your format and try again.")
    }
  },
}
