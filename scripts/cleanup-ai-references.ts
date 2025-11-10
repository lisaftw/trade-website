import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.join(__dirname, "..")

function cleanFile(filePath: string): boolean {
  try {
    let content = fs.readFileSync(filePath, "utf-8")
    let modified = false

    const originalContent = content

    content = content.replace(/console\.(log|error|warn)\s*$$\s*["'`]\[v0\][^)]*$$/g, "")
    content = content.replace(/console\.(log|error|warn)\s*$$\s*`\[v0\][^`]*`[^)]*$$/g, "")
    content = content.replace(/console\.(log|error|warn)\s*$$\s*"\[v0\][^"]*"[^)]*$$/g, "")
    content = content.replace(/console\.(log|error|warn)\s*$$\s*'\[v0\][^']*'[^)]*$$/g, "")

    content = content.replace(/\/\/\s*.*$/gm, "")
    content = content.replace(/\/\*[\s\S]*?\*\//g, "")

    content = content.replace(/\[v0\]/g, "")

    content = content.replace(/\n\s*\n\s*\n/g, "\n\n")

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf-8")
      modified = true
    }

    return modified
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error)
    return false
  }
}

function processDirectory(dir: string, extensions: string[] = [".ts", ".tsx", ".js", ".jsx"]): number {
  let filesModified = 0

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") {
      continue
    }

    if (entry.isDirectory()) {
      filesModified += processDirectory(fullPath, extensions)
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name)
      if (extensions.includes(ext)) {
        if (cleanFile(fullPath)) {
          console.log(`✓ Cleaned: ${path.relative(projectRoot, fullPath)}`)
          filesModified++
        }
      }
    }
  }

  return filesModified
}

console.log("Starting cleanup of AI references...\n")

const directories = [
  path.join(projectRoot, "app"),
  path.join(projectRoot, "components"),
  path.join(projectRoot, "lib"),
  path.join(projectRoot, "scripts"),
  path.join(projectRoot, "discord-bot"),
  path.join(projectRoot, "hooks"),
]

let totalModified = 0

for (const dir of directories) {
  if (fs.existsSync(dir)) {
    console.log(`\nProcessing ${path.basename(dir)}/...`)
    totalModified += processDirectory(dir)
  }
}

console.log(`\n✅ Cleanup complete! Modified ${totalModified} files.`)
