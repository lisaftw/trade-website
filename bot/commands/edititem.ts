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
import { sql } from "@vercel/postgres"

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
          .setCustomId(`edititem_item_${selectedGame}`)
          .setPlaceholder("Select an item to edit")
          .addOptions(
            items.rows.map((item: any) => ({
              label: item.name.substring(0, 100),
              value: item.id,
              description: `Value: ${item.value} | Section: ${item.section || "N/A"}`,
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
        let item
        if (selectedGame === "mm2") {
          item = await sql`SELECT * FROM mm2_items WHERE id = ${itemId}`
        } else if (selectedGame === "sab") {
          item = await sql`SELECT * FROM sab_items WHERE id = ${itemId}`
        } else if (selectedGame === "adoptme") {
          item = await sql`SELECT * FROM adoptme_items WHERE id = ${itemId}`
        }

        if (!item || item.rows.length === 0) {
          await interaction.reply({ content: "❌ Item not found!", ephemeral: true })
          return
        }

        const itemData = item.rows[0]

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
          .setValue(itemData.value.toString())
          .setRequired(true)

        const imageInput = new TextInputBuilder()
          .setCustomId("image")
          .setLabel("Image URL")
          .setStyle(TextInputStyle.Short)
          .setValue(itemData.image_url || "")
          .setRequired(false)

        const extraInput = new TextInputBuilder()
          .setCustomId("extra")
          .setLabel("Rarity/Demand/Pot (format: rarity:value,demand:value)")
          .setStyle(TextInputStyle.Short)
          .setValue(
            [
              itemData.rarity ? `rarity:${itemData.rarity}` : "",
              itemData.demand ? `demand:${itemData.demand}` : "",
              itemData.pot ? `pot:${itemData.pot}` : "",
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

    const [command, modal, selectedGame, itemId] = interaction.customId.split("_")
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
      // Parse extra fields
      const updates: any = { rarity: null, demand: null, pot: null }
      if (extraFields) {
        const pairs = extraFields.split(",")
        pairs.forEach((pair) => {
          const [key, val] = pair.split(":").map((s) => s.trim())
          if (key && val) {
            updates[key] = val
          }
        })
      }

      let result
      if (selectedGame === "mm2") {
        result = await sql`
          UPDATE mm2_items 
          SET name = ${name}, 
              section = ${section}, 
              value = ${value}, 
              image_url = ${image || null},
              rarity = ${updates.rarity || "Common"},
              demand = ${updates.demand || "Unknown"},
              updated_at = NOW()
          WHERE id = ${itemId}
        `
      } else if (selectedGame === "sab") {
        result = await sql`
          UPDATE sab_items 
          SET name = ${name}, 
              section = ${section}, 
              value = ${value}, 
              image_url = ${image || null},
              rarity = ${updates.rarity || "Common"},
              demand = ${updates.demand || "Unknown"},
              updated_at = NOW()
          WHERE id = ${itemId}
        `
      } else if (selectedGame === "adoptme") {
        result = await sql`
          UPDATE adoptme_items 
          SET name = ${name}, 
              section = ${section}, 
              value = ${value}, 
              image_url = ${image || null},
              pot = ${updates.pot || "Normal"},
              demand = ${updates.demand || "Unknown"},
              updated_at = NOW()
          WHERE id = ${itemId}
        `
      }

      if (result && result.rowCount > 0) {
        await interaction.editReply(`✅ Successfully updated **${name}**!`)
      } else {
        await interaction.editReply("⚠️ No changes were made.")
      }
    } catch (error) {
      console.error("Error updating item:", error)
      await interaction.editReply(
        `❌ Failed to update item: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  },
}
