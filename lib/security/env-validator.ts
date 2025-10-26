/**
 * Environment Variable Validation
 * Ensures all required secrets are properly configured
 */

type EnvConfig = {
  name: string
  required: boolean
  sensitive: boolean
}

const ENV_VARS: EnvConfig[] = [
  // Database
  { name: "POSTGRES_URL", required: true, sensitive: true },
  { name: "MONGODB_URI", required: true, sensitive: true },

  // Supabase
  { name: "NEXT_PUBLIC_SUPABASE_URL", required: true, sensitive: false },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: true, sensitive: false },
  { name: "SUPABASE_SERVICE_ROLE_KEY", required: true, sensitive: true },

  // Discord OAuth
  { name: "DISCORD_CLIENT_ID", required: true, sensitive: false },
  { name: "DISCORD_CLIENT_SECRET", required: true, sensitive: true },
  { name: "DISCORD_REDIRECT_URI", required: false, sensitive: false },

  // Admin
  { name: "ADMIN_PASSWORD", required: true, sensitive: true },
]

export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const config of ENV_VARS) {
    const value = process.env[config.name]

    if (config.required && !value) {
      errors.push(`Missing required environment variable: ${config.name}`)
    }

    // Check for common mistakes
    if (value) {
      if (config.sensitive && value.length < 10) {
        errors.push(`${config.name} appears to be too short (possible misconfiguration)`)
      }

      if (value.includes("your_") || value.includes("example")) {
        errors.push(`${config.name} contains placeholder value`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Masks sensitive values for logging
 */
export function maskSensitiveValue(value: string): string {
  if (value.length <= 8) {
    return "***"
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}
