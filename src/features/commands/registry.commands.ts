import {
	CollatedCommandData,
	CommandSetData,
	SlashCommandData,
	SlashSubcommandData,
	SlashSubcommandGroupData,
	TriviousClient,
} from "@typings";
import { TriviousError } from "@utility/errors.js";
import { importFile } from "@utility/functions.js";
import { Collection } from "discord.js";
import { existsSync, promises as fs } from "fs";
import path from "path";

async function parseBase<T>(input: string | T, expects?: (base: Partial<T>) => boolean) {
	let base: T | null = null;
	if (typeof input === "string") {
		base = await importFile<T>(input);
	} else base = input;
	if (!base) return null;
	if (expects && !expects(base)) return null;
	return base;
}

async function parseDirectory(data: CollatedCommandData, directory: string): Promise<void> {
	const files = fs.glob(path.join(directory, "*.{js,ts}"));
	for await (const file of files) {
		const base = await parseBase<SlashCommandData | SlashSubcommandData | SlashSubcommandGroupData>(
			file,
			(base) => "context" in base && !!base.context
		);
		if (!base) continue;
		const targetSet = data[base.context];
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
				`[Trivious] Subcommand '${subcommand.data.name}' under SlashCommand/SubcommandGroup '${parent.data.name}' has been overridden by a subcommand with the same name`
			);
		subcommand.parent = parent;
		parent.subcommands.set(subcommand.data.name, subcommand);
		parent.data.addSubcommand(subcommand.data);
	}
}

export default async function registerCommands(client: TriviousClient, directory: string) {
	if (!existsSync(directory))
		throw new TriviousError(
			`Could not regsiter commands; passed directory ${directory} does not exist`,
			"Nonexistant directory passed"
		);
	const processedDirectories = new Set<string>();
	const files = fs.glob(path.join(directory, "**/*.{js,ts}"));
	const data: CollatedCommandData = {
		SlashCommand: new Set<CommandSetData<SlashCommandData>>(),
		SlashSubcommand: new Set<CommandSetData<SlashSubcommandData>>(),
		SlashSubcommandGroup: new Set<CommandSetData<SlashSubcommandGroupData>>(),
	};
	client.logger.debug("Starting command registration in:", directory);
	for await (const file of files) {
		const parentDir = path.dirname(file);
		if (processedDirectories.has(parentDir)) continue;
		processedDirectories.add(parentDir);
		await parseDirectory(data, parentDir);
	}
	await setChildrenToParents(data);
	for (const [slashCommand] of data.SlashCommand) {
		if (client.stores.commands.chatInput.get(slashCommand.data.name))
			client.logger.warn(
				`Command '${slashCommand.data.name}' has been overridden by a command with the same name`
			);
		client.logger.debug("Registered slash command:", slashCommand.data.name);
		client.stores.commands.chatInput.set(slashCommand.data.name, slashCommand);
	}
}
