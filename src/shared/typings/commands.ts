import { ChatInputCommandInteraction, ContextMenuCommandInteraction } from "src/index.js";

/**
 * Literal type for possible CommandInteractions.
 *
 * @export
 * @typedef {CommandInteraction}
 */
export type CommandInteraction = ChatInputCommandInteraction | ContextMenuCommandInteraction;

/**
 * Flags attached to a command.
 *
 * @export
 * @typedef {CommandFlags}
 */
export type CommandFlags = "GuildOnly" | "OwnerOnly" | "EphemeralReply" | "DeferReply";

/**
 * What type of command.
 *
 * @export
 * @typedef {CommandContext}
 */
export type CommandContext = "SlashCommand" | "SlashSubcommand" | "ContextMenu";
