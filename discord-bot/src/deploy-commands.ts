import { REST, Routes } from "discord.js"
import dotenv from "dotenv"
import { addItemCommand } from "./commands/additem.js"
import { editItemCommand } from "./commands/edititem.js"
import { removeItemCommand } from "./commands/removeitem.js"
import { bulkAddItemCommand } from "./commands/bulkadditem.js"
import { migrateImagesCommand } from "./commands/migrate-images.js"
import { analyticsCommand } from "./commands/analytics.js"

dotenv.config()

const commands = [
  addItemCommand.data.toJSON(),
  editItemCommand.data.toJSON(),
  removeItemCommand.data.toJSON(),
  bulkAddItemCommand.data.toJSON(),
  migrateImagesCommand.data.toJSON(),
  analyticsCommand.data.toJSON(),
]

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!)
;(async () => {
  try {
    console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`)

    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!),
      { body: commands },
    )

    console.log(`✅ Successfully reloaded ${(data as any).length} application (/) commands.`)
  } catch (error) {
    console.error("❌ Error deploying commands:", error)
  }
})()
