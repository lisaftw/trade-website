import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  // Only create client if both values exist
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials not found. Client-side features will be limited.")
    // Return a mock client that won't crash
    return {
      from: () => ({
        select: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        insert: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        update: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        delete: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      }),
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
    } as any
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
