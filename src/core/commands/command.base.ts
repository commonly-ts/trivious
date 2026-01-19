import {
	CommandContext,
	CommandFlags,
	PermissionLevel,
} from "src/shared/typings/index.js";
import { CacheType, Collection, ContextMenuCommandBuilder, MessageContextMenuCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { ChatInputCommandInteraction } from "src/index.js";
import TriviousClient from "../client/trivious.client.js";

/**
 * Base command interface.
 *
 * @export
 * @interface Command
 * @typedef {Command}
 */
export interface Command {
	readonly context: CommandContext;
	readonly active: boolean;
	readonly flags?: CommandFlags[];
	readonly permission?: PermissionLevel;
};

/**
 * Slash command interface.
 *
 * @export
 * @interface SlashCommand
 * @typedef {SlashCommand}
 * @extends {Command}
 */
export interface SlashCommand extends Command {
	readonly context: "SlashCommand";
	readonly data: SlashCommandBuilder;
	subcommands?: Collection<string, Command>;
	readonly run?: (client: TriviousClient, interaction: ChatInputCommandInteraction) => Promise<void>;
}

/**
 * Slash command subcommand interface.
 *
 * @export
 * @interface SlashSubcommand
 * @typedef {SlashSubcommand}
 * @extends {Command}
 */
export interface SlashSubcommand extends Command {
	readonly context: "SlashSubcommand";
	readonly data: SlashCommandSubcommandBuilder;
	readonly execute: (client: TriviousClient, interaction: ChatInputCommandInteraction) => Promise<void>;
}

/**
 * Context menu command interface.
 *
 * @export
 * @interface ContextMenuCommand
 * @typedef {ContextMenuCommand}
 * @extends {Command}
 */
export interface ContextMenuCommand extends Command {
	readonly context: "ContextMenu";
	readonly data: ContextMenuCommandBuilder;
	readonly execute: (client: TriviousClient, interaction: MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction<CacheType>) => Promise<void>;
}
