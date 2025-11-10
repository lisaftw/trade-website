import fs from "fs"
import path from "path"
import crypto from "crypto"

const SESSION_DIR = path.join(process.cwd(), ".sessions")

// Ensure session directory exists
if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true })
}

interface Session {
  token: string
  createdAt: number
  expiresAt: number
}

export function createSession(): string {
  const token = crypto.randomUUID()
  const session: Session = {
    token,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  }

  const sessionFile = path.join(SESSION_DIR, `${token}.json`)
  fs.writeFileSync(sessionFile, JSON.stringify(session))

  return token
}

export function validateSession(token: string): boolean {
  try {
    const sessionFile = path.join(SESSION_DIR, `${token}.json`)

    if (!fs.existsSync(sessionFile)) {
      return false
    }

    const sessionData = fs.readFileSync(sessionFile, "utf-8")
    const session: Session = JSON.parse(sessionData)

    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      fs.unlinkSync(sessionFile) // Clean up expired session
      return false
    }

    return true
  } catch (error) {
    console.error("[v0] Session validation error:", error)
    return false
  }
}

export function cleanupExpiredSessions() {
  try {
    const files = fs.readdirSync(SESSION_DIR)

    files.forEach((file) => {
      const filePath = path.join(SESSION_DIR, file)
      const sessionData = fs.readFileSync(filePath, "utf-8")
      const session: Session = JSON.parse(sessionData)

      if (Date.now() > session.expiresAt) {
        fs.unlinkSync(filePath)
      }
    })
  } catch (error) {
    console.error("[v0] Cleanup error:", error)
  }
}
