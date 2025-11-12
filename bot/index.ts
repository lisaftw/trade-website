import "dotenv/config"
import { Client, GatewayIntentBits, Events, Collection } from "discord.js"
import { addItemCommand } from "./commands/additem"
import { editItemCommand } from "./commands/edititem"
import { removeItemCommand } from "./commands/removeitem"
import { supabase } from "./lib/supabase"

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
})

const commands = new Collection()
commands.set(addItemCommand.data.name, addItemCommand)
commands.set(editItemCommand.data.name, editItemCommand)
commands.set(removeItemCommand.data.name, removeItemCommand)

client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅ Discord bot ready! Logged in as ${readyClient.user.tag}`)
  console.log(`📊 Serving ${commands.size} commands`)
})

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isAutocomplete()) {
    const command = commands.get(interaction.commandName)

    if (command && command.autocomplete) {
      try {
        await command.autocomplete(interaction)
      } catch (error) {
        console.error(`❌ Error handling autocomplete:`, error)
      }
    }
    return
  }

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
  console.error(
    "Available env vars:",
    Object.keys(process.env).filter((k) => k.includes("DISCORD")),
  )
  process.exit(1)
}

async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase.from("items").select("count").limit(1).single()
    if (error) throw error
    console.log("✅ Database connected successfully!")
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    console.error("Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment variables")
  }
}

testDatabaseConnection()

client.login(token)
