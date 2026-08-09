import {
	CollatedCommandData,
	CommandSetData,
	ContextCommandData,
	MessageCommandData,
	SlashCommandData,
	SlashSubcommandData,
	SlashSubcommandGroupData,
	TriviousClient,
} from "#typings";
import { TriviousError } from "#utility/errors.js";
import { importFile } from "#utility/functions.js";
import { ApplicationCommandType, Collection } from "discord.js";
import { existsSync, promises as fs } from "fs";
import path from "path";
import { processPartialMessageCommand } from "./handlers/message.commands.js";

const parsedCache = new Set<string>();
async function parseBase<T>(input: string | T, expects?: (base: Partial<T>) => boolean) {
	let base: T | null = null;
	if (typeof input === "string") {
		const absolutePath = path.resolve(input);
		if (parsedCache.has(absolutePath)) return null;
		base = await importFile<T>(input);
		parsedCache.add(absolutePath);
	} else base = input;
	if (!base) return null;
	if (expects && !expects(base)) return null;
	return base;
}

async function parseDirectory(data: CollatedCommandData, directory: string): Promise<void> {
	const files = fs.glob(path.join(directory, "*.{js,ts}"));
	for await (const file of files) {
		const base = await parseBase<
			| SlashCommandData
			| SlashSubcommandData
			| SlashSubcommandGroupData
			| ContextCommandData
			| MessageCommandData
		>(file);
		if (!base) continue;
		const targetSet =
			"context" in base
				? data[base.context]
				: "commandType" in base &&
					  (base.commandType === ApplicationCommandType.Message ||
							base.commandType === ApplicationCommandType.User)
					? data.ContextCommand
					: null;
		if (targetSet) (targetSet as Set<[typeof base, string]>).add([base, directory]);
	}
}

function isSubdirectoryOf(directory: string, subdirectory: string) {
	const relative = path.relative(path.resolve(directory), path.resolve(subdirectory));
	return !!relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function getDataFromCommandSet<Data>(
	set: Set<CommandSetData<Data>>,
	options: { matchParentDirectory?: string; matchData?: Partial<Data> }
) {
	const { matchData, matchParentDirectory } = options;
	if (!matchData && !matchParentDirectory) return undefined;
	const array = Array.from(set.entries());
	let bestMatch: CommandSetData<Data> | undefined;
	let bestDepth = -1;

	for (const entry of array) {
		const [key, [data, directory]] = entry;
		if (matchData && data === matchData) return key[0];
		if (!matchParentDirectory) continue;
		const isExact = directory === matchParentDirectory;
		const isParent = isSubdirectoryOf(directory, matchParentDirectory);
		if (isExact || isParent) {
			const depth = directory.split(/\\|\//).length;
			if (depth > bestDepth) {
				bestDepth = depth;
				bestMatch = entry[0];
			}
		}
	}

	return bestMatch?.[0];
}

async function setChildrenToParents(data: CollatedCommandData) {
	for (const [group, directory] of data.SlashSubcommandGroup) {
		if (group.context !== "SlashSubcommandGroup") continue;
		const slashCommand =
			group.parent || getDataFromCommandSet(data.SlashCommand, { matchParentDirectory: directory });

		if (!slashCommand || !("addSubcommandGroup" in slashCommand.data)) {
			console.warn("[Trivious] Could not find parent for subcommand group", group.data.name);
			continue;
		}
		if (!slashCommand.subcommandGroups) slashCommand.subcommandGroups = new Collection();
		if (slashCommand.subcommandGroups.has(group.data.name))
			console.warn(
				`[Trivious] SubcommandGroup '${group.data.name}' under SlashCommand '${slashCommand.data.name}' has been overridden by a group with the same name`
			);
		group.parent = slashCommand;
		slashCommand.subcommandGroups.set(group.data.name, group);
		slashCommand.data.addSubcommandGroup(group.data);
	}

	for (const [subcommand, directory] of data.SlashSubcommand) {
		if (!subcommand.active || subcommand.context !== "SlashSubcommand") continue;
		const parent =
			subcommand.parent ||
			getDataFromCommandSet(data.SlashSubcommandGroup, { matchParentDirectory: directory }) ||
			getDataFromCommandSet(data.SlashCommand, { matchParentDirectory: directory });

		if (!parent || !("addSubcommand" in parent.data)) {
			console.warn("[Trivious] Could not find parent for subcommand", subcommand.data.name);
			continue;
		}
		if (!parent.subcommands) parent.subcommands = new Collection();
		if (parent.subcommands.has(subcommand.data.name))
			console.warn(
				`[Trivious] Subcommand '${subcommand.data.name}' under parent '${parent.data.name}' has been overridden by a subcommand with the same name`
			);
		subcommand.parent = parent;
		parent.subcommands.set(subcommand.data.name, subcommand);
		parent.data.addSubcommand(subcommand.data);
	}
}

async function registerSlashCommands(client: TriviousClient, data: CollatedCommandData) {
	await setChildrenToParents(data);
	for (const [slashCommand] of data.SlashCommand) {
		if (!slashCommand.active || slashCommand.context !== "SlashCommand") continue;
		if (client.stores.commands.chatInput.get(slashCommand.data.name))
			client.logger.warn(
				`Command '${slashCommand.data.name}' has been overridden by a command with the same name`
			);
		client.logger.debug("Registered slash command:", slashCommand.data.name);
		client.stores.commands.chatInput.set(slashCommand.data.name, slashCommand);
	}
}

async function registerContextMenuCommands(client: TriviousClient, data: CollatedCommandData) {
	for (const [contextCommand] of data.ContextCommand) {
		if (!contextCommand.active) continue;
		if (client.stores.commands.chatInput.get(contextCommand.data.name))
			client.logger.warn(
				`Command '${contextCommand.data.name}' has been overridden by a command with the same name`
			);
		client.logger.debug(
			"Registered",
			ApplicationCommandType[contextCommand.commandType],
			"context command:",
			contextCommand.data.name
		);
		client.stores.commands.context.set(contextCommand.data.name, contextCommand);
	}
}

async function registerMessageCommands(client: TriviousClient, data: CollatedCommandData) {
	for (const [command] of data.MessageCommand) {
		if (!command.active || command.context !== "MessageCommand") continue;
		if (client.stores.commands.chatInput.get(command.name))
			client.logger.warn(
				`Message command '${command.name}' has been overridden by a command with the same name`
			);
		const processedCommand = processPartialMessageCommand(client, command);
		client.logger.debug("Registered message command:", command.name);
		client.stores.commands.message.set(command.name, processedCommand);
		if (command.aliases)
			command.aliases.forEach((alias) => {
				client.logger.debug(
					"Registered message command alias:",
					alias.trim().toLowerCase(),
					"->",
					command.name.toLowerCase()
				);
				client.stores.messageCommandAlises.set(
					alias.trim().toLowerCase(),
					command.name.toLowerCase()
				);
			});
	}
}

export default async function registerCommands(client: TriviousClient, directory: string) {
	if (!existsSync(directory))
		throw new TriviousError(
			`Could not regsiter commands; passed directory ${directory} does not exist`,
			"Nonexistant directory passed"
		);
	const data: CollatedCommandData = {
		SlashCommand: new Set<CommandSetData<SlashCommandData>>(),
		SlashSubcommand: new Set<CommandSetData<SlashSubcommandData>>(),
		SlashSubcommandGroup: new Set<CommandSetData<SlashSubcommandGroupData>>(),
		ContextCommand: new Set<CommandSetData<ContextCommandData>>(),
		MessageCommand: new Set<CommandSetData<MessageCommandData>>(),
	};
	client.logger.debug("Starting command registration in:", directory);
	const files = fs.glob(path.join(directory, "**/*.{js,ts}"));
	const processedDirectories = new Set<string>();
	for await (const file of files) {
		const parentDir = path.dirname(file);
		if (processedDirectories.has(parentDir)) continue;
		processedDirectories.add(parentDir);
		await parseDirectory(data, parentDir);
	}
	await registerSlashCommands(client, data);
	await registerMessageCommands(client, data);
	await registerContextMenuCommands(client, data);
	parsedCache.clear();
}
