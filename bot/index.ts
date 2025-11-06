import { Client, GatewayIntentBits, Events, Collection } from "discord.js"
import dotenv from "dotenv"
import { addItemCommand } from "./commands/additem"
import { editItemCommand } from "./commands/edititem"
import { removeItemCommand } from "./commands/removeitem"

dotenv.config({ path: ".env.local" })

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
})

// Store commands in a collection
const commands = new Collection()
commands.set(addItemCommand.data.name, addItemCommand)
commands.set(editItemCommand.data.name, editItemCommand)
commands.set(removeItemCommand.data.name, removeItemCommand)

client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅ Discord bot ready! Logged in as ${readyClient.user.tag}`)
  console.log(`📊 Serving ${commands.size} commands`)
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
      const errorMessage = { content: "There was an error executing this command!", ephemeral: true }

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
        await interaction.reply({ content: "There was an error processing your selection!", ephemeral: true })
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
        await interaction.reply({ content: "There was an error processing your submission!", ephemeral: true })
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
        await interaction.reply({ content: "There was an error processing your action!", ephemeral: true })
      }
    }
  }
})

const token = process.env.DISCORD_BOT_TOKEN

if (!token) {
  console.error("❌ DISCORD_BOT_TOKEN is not set in environment variables!")
  process.exit(1)
}

client.login(token)
