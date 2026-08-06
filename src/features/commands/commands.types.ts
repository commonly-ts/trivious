import { CommandPermissionValues, TriviousClient } from "#typings";
import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	Collection,
	ContextMenuCommandBuilder,
	Interaction,
	Message,
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
export type MessageCommandFlags = "InGuild" | "OutGuild";
export type CommandFunction<T extends Interaction> = (
	client: TriviousClient,
	interaction: T
) => Promise<void>;

/**
 * Base Trivious command data
 *
 * @param active Whether or not to register and recognise the command
 * @param permissions What users and roles can use the command
 */
export interface BaseCommandData {
	active: boolean;
	permissions?: CommandPermissionValues;
}

/**
 * Base Trivious chat input command data
 *
 * @param context The chat input command context
 * @param commandType ApplicationCommandType.ChatInput
 */
export interface BaseChatInputCommandData extends BaseCommandData {
	flags?: CommandFlags[];
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
	flags?: CommandFlags[];
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
	subcommands?: Collection<string, SlashSubcommandData<true>>;
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
	subcommands: Collection<string, SlashSubcommandData>;
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
export interface SlashSubcommandData<Processed extends boolean = false>
	extends BaseChatInputCommandData {
	context: "SlashSubcommand";
	data: SlashCommandSubcommandBuilder;
	execute: CommandFunction<ChatInputCommandInteraction>;
	parent?: Processed extends true
		? SlashCommandData | SlashSubcommandGroupData<true>
		: SlashCommandData | SlashSubcommandGroupData<false>;
}

export type CommandSetData<Data> = [Data, directory: string];

export type CollatedCommandData = {
	SlashCommand: Set<CommandSetData<SlashCommandData>>;
	SlashSubcommand: Set<CommandSetData<SlashSubcommandData>>;
	SlashSubcommandGroup: Set<CommandSetData<SlashSubcommandGroupData>>;
	ContextCommand: Set<CommandSetData<ContextCommandData>>;
	MessageCommand: Set<CommandSetData<MessageCommandData>>;
};

export interface MessageCommandBaseData {
	active: boolean;
	permissions?: CommandPermissionValues;
}

export type ReadOnlyStrArray = readonly string[] | undefined;
export type MessageCommandArgs<Arguments extends ReadOnlyStrArray> =
	Arguments extends readonly string[]
		? [Arguments[number]] extends [never]
			? null
			: Map<Arguments[number], string>
		: null;

export interface MessageCommandData<
	Arguments extends ReadOnlyStrArray = readonly string[] | undefined,
	InGuild extends boolean = boolean,
> extends BaseCommandData {
	context: "MessageCommand";
	name: string;
	arguments?: Arguments;
	aliases?: string[];
	flags?: MessageCommandFlags[];
	execute: (
		client: TriviousClient,
		message: Message<InGuild>,
		args: MessageCommandArgs<Arguments>
	) => Promise<void>;
}
