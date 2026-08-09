import { MessageCommandArgument, MessageCommandData, TriviousClient } from "#typings";
import { bold, inlineCode } from "discord.js";

export function resolveCommand(client: TriviousClient, query: string) {
	const targetName = client.stores.messageCommandAliases.get(query) ?? query;
	return client.stores.commands.message.get(targetName);
}

export function formatUsage(prefix: string, command: MessageCommandData<true>): string {
	if (!command.arguments?.length) return `${prefix}${command.name}`;

	const formattedArgs = command.arguments
		.map((arg: any) => (arg.required ? `<${arg.name}>` : `[${arg.name}]`))
		.join(" ");

	return `${prefix}${command.name} ${formattedArgs}`;
}

export function formatArguments(args?: readonly MessageCommandArgument[]): string {
	if (!args?.length) return "";

	const list = args
		.map((arg) => `-# ${bold(arg.name)} (${arg.dataType}) - ${arg.description}`)
		.join("\n");

	return `\nArguments:\n${list}`;
}

export function formatAliases(prefix: string, aliases: string[] | undefined): string {
	if (!aliases || aliases.length === 0) return "";
	const formattedList = aliases.map((alias: string) => inlineCode(`${prefix}${alias}`)).join(", ");
	return `\n\nAliases: ${formattedList}`;
}
