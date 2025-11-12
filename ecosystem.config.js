const fs = require("fs")
const path = require("path")

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env")
  const env = {}

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8")
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=")
        if (key) {
          env[key.trim()] = valueParts.join("=").trim()
        }
      }
    })
  }

  return env
}

const envVars = loadEnvFile()

module.exports = {
  apps: [
    {
      name: "trading-website",
      script: "npm",
      args: "start",
      cwd: "/home/deploy/trading-website",
      instances: 5,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000 + Number.parseInt(process.env.pm_id || 0),
        ...envVars,
      },
      max_memory_restart: "4G",
      error_file: "/home/deploy/logs/website-error.log",
      out_file: "/home/deploy/logs/website-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: "10s",
    },
    {
      name: "discord-bot",
      script: "npm",
      args: "run bot",
      cwd: "/home/deploy/trading-website",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        ...envVars,
      },
      max_memory_restart: "500M",
      error_file: "/home/deploy/logs/bot-error.log",
      out_file: "/home/deploy/logs/bot-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
}
