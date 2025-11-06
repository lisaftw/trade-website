import dotenv from "dotenv"
dotenv.config()

import { MongoClient, ServerApiVersion } from "mongodb"

declare global {
  
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

const uri = process.env.MONGODB_URI

if (!uri) {
  console.error("❌ MONGODB_URI environment variable is not set")
  console.error("Please ensure you have a .env file in the discord-bot directory with:")
  console.error("MONGODB_URI=your_mongodb_connection_string")
  throw new Error("MONGODB_URI environment variable is not set")
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options)
  global._mongoClientPromise = client.connect()
}

clientPromise = global._mongoClientPromise

export default clientPromise

export async function getDatabase() {
  const client = await clientPromise
  return client.db("trading-db")
}

export async function getItemsCollection() {
  const db = await getDatabase()
  return db.collection("items")
}
