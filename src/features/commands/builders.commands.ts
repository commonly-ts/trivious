import {
	ContextCommandData,
	MessageCommandArgument,
	MessageCommandData,
	RO_ArrayType,
	SlashCommandData,
	SlashSubcommandData,
	SlashSubcommandGroupData,
} from "#typings";
import { ApplicationCommandType, Collection } from "discord.js";

export function createMessageCommand<
	const T extends RO_ArrayType<MessageCommandArgument> = undefined,
>(
	command: Omit<MessageCommandData<false, T>, "context" | "metadata">
): Omit<MessageCommandData<false, T>, "metadata"> {
	return {
		context: "MessageCommand",
		...command,
	};
}

export function createSlashCommand(
	data: Omit<SlashCommandData, "context" | "commandType" | "subcommands" | "subcommandGroups">
): SlashCommandData {
	return {
		...data,
		context: "SlashCommand",
		commandType: ApplicationCommandType.ChatInput,
	} satisfies SlashCommandData;
}

/**
 * @deprecated Use createSlashSubcommand instead
 */
export function createSubcommand(
	data: Omit<SlashSubcommandData, "context" | "commandType">
): SlashSubcommandData {
	return {
		...data,
		context: "SlashSubcommand",
		commandType: ApplicationCommandType.ChatInput,
	} satisfies SlashSubcommandData;
}

export function createSlashSubcommand(
	data: Omit<SlashSubcommandData, "context" | "commandType">
): SlashSubcommandData {
	return {
		...data,
		context: "SlashSubcommand",
		commandType: ApplicationCommandType.ChatInput,
	} satisfies SlashSubcommandData;
}

/**
 * @deprecated Use createSlashSubcommandGroup instead
 */
export function createSubcommandGroup(
	data: Omit<SlashSubcommandGroupData, "context" | "subcommands">
): SlashSubcommandGroupData {
	return {
		...data,
		context: "SlashSubcommandGroup",
		subcommands: new Collection(),
	} satisfies SlashSubcommandGroupData;
}

export function createSlashSubcommandGroup(
	data: Omit<SlashSubcommandGroupData, "context" | "subcommands">
): SlashSubcommandGroupData {
	return {
		...data,
		context: "SlashSubcommandGroup",
		subcommands: new Collection(),
	} satisfies SlashSubcommandGroupData;
}

export function createMessageContextCommand(
	data: Omit<ContextCommandData<"Message">, "commandType">
): ContextCommandData<"Message"> {
	data.data.setType(ApplicationCommandType.Message);
	return {
		...data,
		commandType: ApplicationCommandType.Message,
	} satisfies ContextCommandData<"Message">;
}

export function createUserContextCommand(
	data: Omit<ContextCommandData<"User">, "commandType">
): ContextCommandData<"User"> {
	data.data.setType(ApplicationCommandType.User);
	return {
		...data,
		commandType: ApplicationCommandType.User,
	} satisfies ContextCommandData<"User">;
}
