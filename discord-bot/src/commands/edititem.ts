import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type StringSelectMenuInteraction,
  type ModalSubmitInteraction,
  type ButtonInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js"
import { sql } from "../lib/database.js"
import { GAME_CHOICES, type BotCommand } from "../lib/types.js"

const paginationState = new Map<string, { game: string; page: number; totalItems: number }>()

export const editItemCommand: BotCommand = {
  data: new SlashCommandBuilder().setName("edititem").setDescription("Edit an existing item in the database"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true })

    try {
      const games = await sql`SELECT DISTINCT game FROM items ORDER BY game`

      if (games.length === 0) {
        await interaction.editReply("❌ No items found in the database!")
        return
      }

      // Create game selection dropdown
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("edititem_game")
        .setPlaceholder("Select a game")
        .addOptions(
          games.map((row: any) => ({
            label: GAME_CHOICES.find((g) => g.value === row.game)?.name || row.game,
            value: row.game,
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

      paginationState.set(interaction.user.id, { game: selectedGame, page: 0, totalItems: 0 })

      try {
        await showItemsPage(interaction, selectedGame, 0)
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
        const items = await sql`SELECT * FROM items WHERE id = ${itemId} LIMIT 1`

        if (items.length === 0) {
          await interaction.reply({
            content: "❌ Item not found!",
            flags: 64,
          })
          return
        }

        const item = items[0]

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
          .setValue(item.rap_value?.toString() || "0")
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
          flags: 64,
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
      const items = await sql`SELECT * FROM items WHERE id = ${itemId} LIMIT 1`

      if (items.length === 0) {
        await interaction.editReply("❌ Item not found!")
        return
      }

      const item = items[0]

      // Parse extra field based on game
      const [field1, field2] = extra.split("|").map((s) => s.trim())

      const now = new Date().toISOString()

      if (item.game === "Adopt Me") {
        await sql`
          UPDATE items 
          SET name = ${name},
              section = ${section},
              rap_value = ${value},
              image_url = ${image},
              pot = ${field1 || null},
              demand = ${field2 || null},
              updated_at = ${now},
              last_updated_at = ${now}
          WHERE id = ${itemId}
        `
      } else {
        await sql`
          UPDATE items 
          SET name = ${name},
              section = ${section},
              rap_value = ${value},
              image_url = ${image},
              rarity = ${field1 || null},
              demand = ${field2 || null},
              updated_at = ${now},
              last_updated_at = ${now}
          WHERE id = ${itemId}
        `
      }

      await interaction.editReply(`✅ Successfully updated **${name}** in ${item.game}!`)
    } catch (error) {
      console.error("Error updating item:", error)
      await interaction.editReply("❌ Failed to update item. Please try again.")
    }
  },

  async handleButton(interaction: ButtonInteraction) {
    await interaction.deferUpdate()

    const [command, action, pageStr] = interaction.customId.split("_")

    if (action === "page") {
      const state = paginationState.get(interaction.user.id)
      if (!state) {
        await interaction.editReply({
          content: "❌ Session expired. Please run the command again.",
          components: [],
        })
        return
      }

      const newPage = Number.parseInt(pageStr)
      state.page = newPage

      try {
        await showItemsPage(interaction, state.game, newPage)
      } catch (error) {
        console.error("Error loading page:", error)
        await interaction.editReply({
          content: "❌ Failed to load page. Please try again.",
          components: [],
        })
      }
    }
  },
}

async function showItemsPage(interaction: StringSelectMenuInteraction | ButtonInteraction, game: string, page: number) {
  const ITEMS_PER_PAGE = 25

  const [countResult] = await sql`SELECT COUNT(*)::int as count FROM items WHERE game = ${game}`
  const totalItems = countResult.count

  if (totalItems === 0) {
    await interaction.editReply({
      content: `❌ No items found for ${game}!`,
      components: [],
    })
    return
  }

  // Get items for current page
  const items = await sql`
    SELECT * FROM items 
    WHERE game = ${game}
    ORDER BY section, name
    LIMIT ${ITEMS_PER_PAGE}
    OFFSET ${page * ITEMS_PER_PAGE}
  `

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("edititem_item")
    .setPlaceholder("Select an item to edit")
    .addOptions(
      items.map((item: any) => ({
        label: `${item.name} (${item.section})`,
        description: `Value: ${item.rap_value || 0}`,
        value: item.id.toString(),
      })),
    )

  const components: ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] = [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu),
  ]

  // Add pagination buttons if there are multiple pages
  if (totalPages > 1) {
    const prevButton = new ButtonBuilder()
      .setCustomId(`edititem_page_${page - 1}`)
      .setLabel("◀ Previous")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === 0)

    const nextButton = new ButtonBuilder()
      .setCustomId(`edititem_page_${page + 1}`)
      .setLabel("Next ▶")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page >= totalPages - 1)

    components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(prevButton, nextButton))
  }

  await interaction.editReply({
    content: `Select an item from **${game}** to edit:\nPage ${page + 1} of ${totalPages} (${totalItems} total items)`,
    components,
  })
}
