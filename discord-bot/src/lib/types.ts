import type {
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  ChatInputCommandInteraction,
  StringSelectMenuInteraction,
  ModalSubmitInteraction,
  ButtonInteraction,
} from "discord.js"

export interface BaseItem {
  name: string
  section: string
  value: number
  image_url: string
  game: "MM2" | "Adopt Me" | "SAB" | "GAG"
  createdAt: Date
  updatedAt: Date
}

export interface MM2Item extends BaseItem {
  game: "MM2"
  rarity: string
  demand: string
}

export interface AdoptMeItem extends BaseItem {
  game: "Adopt Me"
  demand: string
  pot: string
}

export interface SABItem extends BaseItem {
  game: "SAB"
  rarity: string
  demand: string
}

export interface GAGItem extends BaseItem {
  game: "GAG"
  rarity: string
  demand: string
}

export type GameItem = MM2Item | AdoptMeItem | SABItem | GAGItem

export type GameType = "MM2" | "Adopt Me" | "SAB" | "GAG"

export const GAME_CHOICES = [
  { name: "Murder Mystery 2", value: "MM2" },
  { name: "Adopt Me", value: "Adopt Me" },
  { name: "Steal a Brain Rot", value: "SAB" },
  { name: "Grow a Garden", value: "GAG" },
] as const

export interface BotCommand {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>
  handleSelectMenu?: (interaction: StringSelectMenuInteraction) => Promise<void>
  handleModal?: (interaction: ModalSubmitInteraction) => Promise<void>
  handleButton?: (interaction: ButtonInteraction) => Promise<void>
}
