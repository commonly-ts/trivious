import {
	ContextCommandData,
	SlashCommandData,
	SlashSubcommandData,
	SlashSubcommandGroupData,
} from "#typings";
import { ApplicationCommandType, Collection } from "discord.js";

export function createSlashCommand(
	data: Omit<SlashCommandData, "context" | "commandType" | "subcommands" | "subcommandGroups">
): SlashCommandData {
	return {
		...data,
		context: "SlashCommand",
		commandType: ApplicationCommandType.ChatInput,
	} satisfies SlashCommandData;
}

export function createSubcommand(
	data: Omit<SlashSubcommandData, "context" | "commandType" | "parent">
): SlashSubcommandData {
	return {
		...data,
		context: "SlashSubcommand",
		commandType: ApplicationCommandType.ChatInput,
	} satisfies SlashSubcommandData;
}

export function createSubcommandGroup(
	data: Omit<SlashSubcommandGroupData, "context" | "parent" | "subcommands">
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
	return {
		...data,
		commandType: ApplicationCommandType.Message,
	} satisfies ContextCommandData<"Message">;
}

export function createUserContextCommand(
	data: Omit<ContextCommandData<"User">, "commandType">
): ContextCommandData<"User"> {
	return {
		...data,
		commandType: ApplicationCommandType.User,
	} satisfies ContextCommandData<"User">;
}
