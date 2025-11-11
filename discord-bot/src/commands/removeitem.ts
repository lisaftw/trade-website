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
import { sql } from "../lib/database.js"
import { GAME_CHOICES, type BotCommand } from "../lib/types.js"

const paginationState = new Map<string, { game: string; page: number; totalItems: number }>()

export const removeItemCommand: BotCommand = {
  data: new SlashCommandBuilder().setName("removeitem").setDescription("Remove an item from the database"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: 64 })

    try {
      const games = await sql`SELECT DISTINCT game FROM items ORDER BY game`

      if (games.length === 0) {
        await interaction.editReply("❌ No items found in the database!")
        return
      }

      // Create game selection dropdown
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("removeitem_game")
        .setPlaceholder("Select a game")
        .addOptions(
          games.map((row: any) => ({
            label: GAME_CHOICES.find((g) => g.value === row.game)?.name || row.game,
            value: row.game,
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
      await interaction.deferUpdate()

      const itemId = interaction.values[0]

      try {
        const items = await sql`SELECT * FROM items WHERE id = ${itemId} LIMIT 1`

        if (items.length === 0) {
          await interaction.editReply({
            content: "❌ Item not found!",
            components: [],
          })
          return
        }

        const item = items[0]

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
    const [command, action, param] = interaction.customId.split("_")

    if (action === "page") {
      await interaction.deferUpdate()

      const state = paginationState.get(interaction.user.id)
      if (!state) {
        await interaction.editReply({
          content: "❌ Session expired. Please run the command again.",
          components: [],
        })
        return
      }

      const newPage = Number.parseInt(param)
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
      return
    }

    // Handle confirm/cancel buttons
    if (action === "confirm") {
      await interaction.deferUpdate()

      try {
        const items = await sql`SELECT * FROM items WHERE id = ${param} LIMIT 1`

        if (items.length === 0) {
          await interaction.editReply({
            content: "❌ Item not found!",
            components: [],
          })
          return
        }

        const item = items[0]

        await sql`DELETE FROM items WHERE id = ${param}`

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
    .setCustomId("removeitem_item")
    .setPlaceholder("Select an item to remove")
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
      .setCustomId(`removeitem_page_${page - 1}`)
      .setLabel("◀ Previous")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === 0)

    const nextButton = new ButtonBuilder()
      .setCustomId(`removeitem_page_${page + 1}`)
      .setLabel("Next ▶")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page >= totalPages - 1)

    components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(prevButton, nextButton))
  }

  await interaction.editReply({
    content: `Select an item from **${game}** to remove:\nPage ${page + 1} of ${totalPages} (${totalItems} total items)`,
    components,
  })
}
