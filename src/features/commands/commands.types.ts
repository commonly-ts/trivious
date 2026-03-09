import { CacheType, ChatInputCommandInteraction, Collection, SlashCommandSubcommandsOnlyBuilder, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";
import TriviousClient from "#feature/client/trivious.client.js";

export type CommandBaseContext = "SlashCommand" | "SlashSubcommand" | "SlashSubcommandGroup";
export type CommandFlags = "RequireCached" | "DeferReply" | "EphemerealReply" | "ExpectModal";

export type ChatInputCommandFunction = (
	client: TriviousClient,
	interaction: ChatInputCommandInteraction<CacheType>
) => Promise<void>;

/**
 * Base Trivious command data
 *
 * @param context The command context
 * @param active Whether or not to register and recognise the command
 * @param flags Command behaviour modifiers
 */
export interface BaseCommandData {
	context: CommandBaseContext;
	active: boolean;
	flags?: CommandFlags[];
}

/**
 * Trivious slash command data
 *
 * @param context SlashCommand
 * @param data The slash command builder
 * @param subcommands Collection of Subcommands, cannot co-exist with `subcommandGroups`
 * @param subcommandGroups Collection of subcommand Groups, cannot co-exist with `subcommands`
 * @param run Function for when the command is executed, not required if the command has subcommands or subcommand groups unless you intend to have extra behaviour
 */
export interface SlashCommandData extends BaseCommandData {
	context: "SlashCommand";
	data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
	subcommands?: Collection<string, SlashSubcommandData>;
	subcommandGroups?: Collection<string, SlashSubcommandGroupData>;
	run?: ChatInputCommandFunction;
}

/**
 * Trivious slash subcommand group data
 *
 * This is intended for internal use and shouldn't be used outside of Trivious
 *
 * @param data The slash subcommand group builder
 * @param subcommands Collection of Subcommands
 */
export interface SlashSubcommandGroupData {
	data: SlashCommandSubcommandGroupBuilder;
	subcommands: Collection<string, SlashSubcommandData>;
}

/**
 * Trivious slash subcommand data
 *
 * @param context SlashSubcommand
 * @param data The slash subcommand builder
 * @param execute Function for when the subcommand is executed
 */
export interface SlashSubcommandData extends BaseCommandData {
	context: "SlashSubcommand";
	data: SlashCommandSubcommandBuilder;
	execute: ChatInputCommandFunction;
}
