import { Client, GatewayIntentBits, Events, Collection } from "discord.js"
import dotenv from "dotenv"
import type { BotCommand } from "./lib/types.js"

dotenv.config()

import { addItemCommand } from "./commands/additem.js"
import { editItemCommand } from "./commands/edititem.js"
import { removeItemCommand } from "./commands/removeitem.js"
import { bulkAddItemCommand } from "./commands/bulkadditem.js"
import { migrateImagesCommand } from "./commands/migrate-images.js"

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
})

const commands = new Collection<string, BotCommand>()
commands.set(addItemCommand.data.name, addItemCommand)
commands.set(editItemCommand.data.name, editItemCommand)
commands.set(removeItemCommand.data.name, removeItemCommand)
commands.set(bulkAddItemCommand.data.name, bulkAddItemCommand)
commands.set(migrateImagesCommand.data.name, migrateImagesCommand)

client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅ Discord bot ready! Logged in as ${readyClient.user.tag}`)
  console.log(`📊 Serving ${commands.size} commands`)
  console.log(`🎮 Managing items for: MM2, Adopt Me, SAB, GAG`)
})

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = commands.get(interaction.commandName)

    if (!command) {
      console.error(`❌ No command matching ${interaction.commandName} was found.`)
      return
    }

    try {
      await command.execute(interaction)
    } catch (error) {
      console.error(`❌ Error executing ${interaction.commandName}:`, error)
      const errorMessage = { content: "There was an error executing this command!", flags: 64 }

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage)
      } else {
        await interaction.reply(errorMessage)
      }
    }
  } else if (interaction.isStringSelectMenu()) {
    // Handle select menu interactions for edit/remove commands
    const command = commands.get(interaction.customId.split("_")[0])

    if (command && command.handleSelectMenu) {
      try {
        await command.handleSelectMenu(interaction)
      } catch (error) {
        console.error(`❌ Error handling select menu:`, error)
        await interaction.reply({ content: "There was an error processing your selection!", flags: 64 })
      }
    }
  } else if (interaction.isModalSubmit()) {
    // Handle modal submissions for edit command
    const command = commands.get(interaction.customId.split("_")[0])

    if (command && command.handleModal) {
      try {
        await command.handleModal(interaction)
      } catch (error) {
        console.error(`❌ Error handling modal:`, error)
        try {
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: "There was an error processing your submission!", flags: 64 })
          } else {
            await interaction.followUp({ content: "There was an error processing your submission!", flags: 64 })
          }
        } catch (replyError) {
          console.error("Failed to send error message (interaction may have expired)")
        }
      }
    }
  } else if (interaction.isButton()) {
    // Handle button interactions for remove confirmation
    const command = commands.get(interaction.customId.split("_")[0])

    if (command && command.handleButton) {
      try {
        await command.handleButton(interaction)
      } catch (error) {
        console.error(`❌ Error handling button:`, error)
        try {
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: "There was an error processing your action!", flags: 64 })
          } else {
            await interaction.followUp({ content: "There was an error processing your action!", flags: 64 })
          }
        } catch (replyError) {
          console.error("Failed to send error message (interaction may have expired)")
        }
      }
    }
  }
})

const token = process.env.DISCORD_BOT_TOKEN

if (!token) {
  console.error("❌ DISCORD_BOT_TOKEN is not set in environment variables!")
  console.error("Please create a .env file with your bot token")
  process.exit(1)
}

client.login(token)
