import { REST, Routes } from "discord.js"
import "dotenv/config"
import { addItemCommand } from "./commands/additem"
import { editItemCommand } from "./commands/edititem"
import { removeItemCommand } from "./commands/removeitem"

const commands = [addItemCommand.data.toJSON(), editItemCommand.data.toJSON(), removeItemCommand.data.toJSON()]

const token = process.env.DISCORD_BOT_TOKEN
const clientId = process.env.DISCORD_CLIENT_ID

if (!token || !clientId) {
  console.error("❌ Missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID in environment variables!")
  process.exit(1)
}

const rest = new REST().setToken(token)
;(async () => {
  try {
    console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`)

    const data = (await rest.put(Routes.applicationCommands(clientId), { body: commands })) as any[]

    console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`)
  } catch (error) {
    console.error("❌ Error deploying commands:", error)
  }
})()
