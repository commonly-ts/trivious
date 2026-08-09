import { CommandPermissionValues, TriviousClient } from "#typings";
import {
	ApplicationCommandType,
	Channel,
	ChatInputCommandInteraction,
	Collection,
	ContextMenuCommandBuilder,
	Interaction,
	Message,
	MessageContextMenuCommandInteraction,
	Role,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
	SlashCommandSubcommandsOnlyBuilder,
	User,
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

export type RO_ArrayType<T> = readonly T[] | undefined;
export type MessageCommandArgs<Arguments extends RO_ArrayType<MessageCommandArgument>> =
	Arguments extends readonly MessageCommandArgument[]
		? [Arguments[number]] extends [never]
			? null
			: MessageCommandArgumentsMap<Arguments>
		: null;

export type ResolveArgType<Argument extends MessageCommandArgument> =
	Argument["dataType"] extends keyof MessageCommandArgumentTypeMap
		? MessageCommandArgumentTypeMap[Argument["dataType"]]
		: unknown;

export type MessageCommandArgumentType = keyof MessageCommandArgumentTypeMap;
export interface MessageCommandArgumentTypeMap {
	"text": string;
	"number": number;
	"date": Date;
	"timestamp": Date;
	"snowflake": string;
	"snowflake/user": User;
	"snowflake/channel": Channel;
	"snowflake/role": Role;
	"duration": number;
}

export interface MessageCommandArgumentsMap<Args extends readonly MessageCommandArgument[]>
	extends Omit<Collection<string, any>, "get"> {
	get<K extends Args[number]["name"]>(
		key: K
	): Extract<Args[number], { name: K }> extends infer Arg
		? Arg extends MessageCommandArgument
			? Arg["required"] extends true
				? ResolveArgType<Arg>
				: ResolveArgType<Arg> | undefined
			: undefined
		: undefined;
}

export interface MessageCommandArgument {
	name: string;
	description: string;
	dataType: MessageCommandArgumentType;
	required?: boolean;
	value?: string;
}

export interface MessageCommandInteraction<
	Arguments extends RO_ArrayType<MessageCommandArgument> =
		| readonly MessageCommandArgument[]
		| undefined,
	InGuild extends boolean = boolean,
> {
	args: MessageCommandArgs<Arguments>;
	command: MessageCommandData<true>;
	message: Message<InGuild>;
}

export interface MessageCommandMetadata {
	regex: RegExp;
	usage: string;
}

export interface MessageCommandData<
	Processed extends boolean = boolean,
	Arguments extends RO_ArrayType<MessageCommandArgument> =
		| readonly MessageCommandArgument[]
		| undefined,
	InGuild extends boolean = boolean,
> extends BaseCommandData {
	context: "MessageCommand";
	name: string;
	description: string;
	arguments?: Arguments;
	aliases?: string[];
	flags?: MessageCommandFlags[];
	metadata: Processed extends true ? MessageCommandMetadata : undefined;
	execute: (
		client: TriviousClient,
		interaction: MessageCommandInteraction<Arguments, InGuild>
	) => Promise<void>;
}
