import { CommandPermissionValues, TriviousClient } from "#typings";
import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	Collection,
	ContextMenuCommandBuilder,
	Interaction,
	MessageContextMenuCommandInteraction,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
	SlashCommandSubcommandsOnlyBuilder,
	UserContextMenuCommandInteraction,
} from "discord.js";

export type ChatInputCommandContext = "SlashCommand" | "SlashSubcommand" | "SlashSubcommandGroup";
export type CommandFlags = "Cached" | "DeferReply" | "EphemeralReply" | "ExpectModal";
export type CommandFunction<T extends Interaction> = (
	client: TriviousClient,
	interaction: T
) => Promise<void>;

/**
 * Base Trivious command data
 *
 * @param context The command context
 * @param commandType ApplicationCommandType
 * @param active Whether or not to register and recognise the command
 * @param flags Command behaviour modifiers
 */
export interface BaseCommandData {
	active: boolean;
	flags?: CommandFlags[];
	permissions?: CommandPermissionValues;
}

/**
 * Base Trivious chat input command data
 *
 * @param context The chat input command context
 * @param commandType ApplicationCommandType.ChatInput
 */
export interface BaseChatInputCommandData extends BaseCommandData {
	context: ChatInputCommandContext;
	commandType: ApplicationCommandType.ChatInput;
}

/**
 * Base Trivious context command data
 *
 * @param commandType ApplicationCommandType.Message | ApplicationCommandType.User
 */
export interface ContextCommandData<T extends "Message" | "User" | null = null>
	extends BaseCommandData {
	commandType: T extends null
		? ApplicationCommandType.Message | ApplicationCommandType.User
		: T extends "Message"
			? ApplicationCommandType.Message
			: ApplicationCommandType.User;
	data: ContextMenuCommandBuilder;
	execute: CommandFunction<
		T extends null
			? MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction
			: T extends "Message"
				? MessageContextMenuCommandInteraction
				: UserContextMenuCommandInteraction
	>;
}

/**
 * Trivious slash command data
 *
 * @param context SlashCommand
 * @param commandType ApplicationCommandType.ChatInput
 * @param data The slash command builder
 * @param subcommands Collection of Subcommands, cannot co-exist with `subcommandGroups`
 * @param subcommandGroups Collection of subcommand Groups, cannot co-exist with `subcommands`
 * @param run Function for when the command is executed, not required if the command has subcommands or subcommand groups unless you intend to have extra behaviour
 */
export interface SlashCommandData extends BaseChatInputCommandData {
	context: "SlashCommand";
	data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
	subcommands?: Collection<string, SlashSubcommandData<"command", true>>;
	subcommandGroups?: Collection<string, SlashSubcommandGroupData<true>>;
	run?: CommandFunction<ChatInputCommandInteraction>;
}

/**
 * Trivious slash subcommand group data
 *
 * @param data The slash subcommand group builder
 * @param subcommands Collection of Subcommands
 */
export interface SlashSubcommandGroupData<Processed extends boolean = false> {
	context: "SlashSubcommandGroup";
	data: SlashCommandSubcommandGroupBuilder;
	subcommands: Collection<string, SlashSubcommandData<"group", boolean>>;
	parent?: Processed extends true ? SlashCommandData : SlashCommandData | undefined;
}

/**
 * Trivious slash subcommand data
 *
 * @param context SlashSubcommand
 * @param commandType ApplicationCommandType.ChatInput
 * @param data The slash subcommand builder
 * @param execute Function for when the subcommand is executed
 */
export interface SlashSubcommandData<
	Parent extends "command" | "group" = "command",
	Processed extends boolean = false,
> extends BaseChatInputCommandData {
	context: "SlashSubcommand";
	data: SlashCommandSubcommandBuilder;
	execute: CommandFunction<ChatInputCommandInteraction>;
	parent?: Processed extends true
		? Parent extends "command"
			? SlashCommandData
			: SlashSubcommandGroupData<true>
		: Parent extends "command"
			? SlashCommandData | undefined
			: SlashSubcommandGroupData<false> | undefined;
}
