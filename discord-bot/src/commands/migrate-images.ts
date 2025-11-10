import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js"
import { MongoClient } from "mongodb"
import fs from "fs"
import path from "path"
import https from "https"
import { fileURLToPath } from "url"
import type { BotCommand } from "../lib/types.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const mongoClient = new MongoClient(process.env.MONGODB_URI!)

async function downloadImageFromDiscord(url: string, itemName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Clean the URL
    const cleanUrl = url.trim().replace(/&$/, "")

    console.log(`[v0] Downloading via Discord API: ${cleanUrl}`)

    https
      .get(cleanUrl, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          // Follow redirect
          const redirectUrl = response.headers.location
          if (redirectUrl) {
            https
              .get(redirectUrl, (redirectResponse) => {
                if (redirectResponse.statusCode !== 200) {
                  reject(new Error(`Failed after redirect: ${redirectResponse.statusCode}`))
                  return
                }
                processResponse(redirectResponse)
              })
              .on("error", reject)
          }
          return
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`))
          return
        }

        processResponse(response)
      })
      .on("error", reject)

    function processResponse(response: any) {
      const chunks: Buffer[] = []
      response.on("data", (chunk: Buffer) => chunks.push(chunk))
      response.on("end", () => {
        const buffer = Buffer.concat(chunks)

        // Determine file extension from content-type or URL
        const contentType = response.headers["content-type"] || ""
        let ext = ".png"
        if (contentType.includes("jpeg") || contentType.includes("jpg")) ext = ".jpg"
        else if (contentType.includes("gif")) ext = ".gif"
        else if (contentType.includes("webp")) ext = ".webp"

        // Create safe filename
        const safeFilename = itemName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
        const filename = `${safeFilename}-${Date.now()}${ext}`

        // Save to public/images/items/
        const publicDir = path.join(__dirname, "../../../public/images/items")
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true })
        }

        const filepath = path.join(publicDir, filename)
        fs.writeFileSync(filepath, buffer)

        const localPath = `/images/items/${filename}`
        console.log(`[v0] Saved to: ${localPath}`)
        resolve(localPath)
      })
    }
  })
}

export const migrateImagesCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("migrate-images")
    .setDescription("Migrate all external image URLs to local storage")
    .setDefaultMemberPermissions(0), // Admin only

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true })

    try {
      await mongoClient.connect()
      const db = mongoClient.db("trading-db")
      const itemsCollection = db.collection("items")

      // Fetch all items with external URLs
      const items = await itemsCollection
        .find({
          $or: [{ imageUrl: { $regex: "discord" } }, { imageUrl: { $regex: "http" } }],
        })
        .toArray()

      if (!items || items.length === 0) {
        await interaction.editReply("No items with external URLs found!")
        return
      }

      await interaction.editReply(`Found ${items.length} items to migrate. Starting download...`)

      let successCount = 0
      let failCount = 0

      for (const item of items) {
        try {
          console.log(`[v0] Processing: ${item.name}`)

          // Skip if already local
          if (item.imageUrl.startsWith("/images/")) {
            console.log(`[v0] Already local, skipping`)
            continue
          }

          // Download image
          const localPath = await downloadImageFromDiscord(item.imageUrl, item.name)

          // Update database
          await itemsCollection.updateOne({ _id: item._id }, { $set: { imageUrl: localPath } })

          successCount++
          console.log(`[v0] ✅ Migrated: ${item.name}`)
        } catch (error) {
          failCount++
          console.error(`[v0] ❌ Failed to migrate ${item.name}:`, error)
        }
      }

      await interaction.editReply(`Migration complete!\n✅ Success: ${successCount}\n❌ Failed: ${failCount}`)
    } catch (error) {
      console.error("Error in migrate-images command:", error)
      await interaction.editReply("An error occurred during migration!")
    } finally {
      await mongoClient.close()
    }
  },
}
