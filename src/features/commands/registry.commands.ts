import {
	BaseChatInputCommandData,
	ContextCommandData,
	SlashCommandData,
	SlashSubcommandData,
	SlashSubcommandGroupData,
	TriviousClient,
} from "#typings";
import { TriviousError } from "#utility/errors.js";
import { importFile } from "#utility/functions.js";
import { ApplicationCommandType, Collection } from "discord.js";
import { Dirent, existsSync, promises as fs } from "fs";
import path, { join } from "path";

function validateCommand<T extends BaseChatInputCommandData | ContextCommandData>(
	command: T,
	expects: (command: Partial<T>) => boolean
): boolean {
	if (!("active" in command && "commandType" in command)) return false;
	if (!command.active) return false;
	return expects(command);
}

async function parseSlashSubcommands(
	directory: string,
	data: SlashCommandData | SlashSubcommandGroupData<boolean>
) {
	const _parentType = "context" in data ? "command" : "group";
	const subcommands = new Collection<string, SlashSubcommandData<typeof _parentType, true>>();

	if (!("addSubcommand" in data.data)) return subcommands;

	const files = fs.glob(join(directory, "./*.js"));
	for await (const file of files) {
		const subcommand = await importFile<SlashSubcommandData<typeof _parentType, true>>(file);
		if (
			!subcommand ||
			!validateCommand(subcommand, (subcmd) => subcmd.context === "SlashSubcommand")
		)
			continue;

		subcommand.parent = data;
		data.data.addSubcommand(subcommand.data);

		if (subcommands.has(subcommand.data.name))
			console.warn(
				`[Trivious] Subcommand '${subcommand.data.name}' under ${data.context} '${data.data.name}' has a duplicate and has been overridden`
			);
		subcommands.set(subcommand.data.name, subcommand);
	}

	if (subcommands.size > 0) data.subcommands = subcommands;
	return subcommands;
}

async function parseSlashCommand(
	file: string,
	parentDir: string,
	subdirectories: Dirent<string>[]
) {
	if (!existsSync(file)) return;

	const command = await importFile<SlashCommandData>(file);
	if (
		!command ||
		!validateCommand(command, (cmd) => cmd.context === "SlashCommand") ||
		!("addSubcommand" in command.data)
	)
		return;

	await parseSlashSubcommands(parentDir, command);

	for (const subdir of subdirectories) {
		const indexFile = path.resolve(subdir.parentPath, subdir.name, "index.js");
		if (!existsSync(indexFile)) continue;

		const group = await importFile<SlashSubcommandGroupData<true>>(indexFile);
		if (
			!group ||
			!("context" in group && "addSubcommandGroup" in command.data) ||
			group.context !== "SlashSubcommandGroup"
		)
			continue;

		group.parent = command;
		if (!command.subcommandGroups) command.subcommandGroups = new Collection();
		await parseSlashSubcommands(join(subdir.parentPath, subdir.name), group);

		if (group.subcommands.size > 0) {
			if (command.subcommandGroups.has(group.data.name))
				console.warn(
					`[Trivious] SubcommandGroup '${group.data.name}' under SlashCommand '${command.data.name}' has a duplicate and has been overridden`
				);

			command.data.addSubcommandGroup(group.data);
			command.subcommandGroups.set(group.data.name, group);
		}
	}

	return command;
}

async function parseContextCommands(parentDir: string) {
	const collection = new Collection<string, ContextCommandData>();
	const files = fs.glob(join(parentDir, "**/*.js"));
	for await (const file of files) {
		const contextCommand = await importFile<ContextCommandData>(file);
		if (
			!contextCommand ||
			!validateCommand(
				contextCommand,
				(cmd) =>
					cmd.commandType === ApplicationCommandType.Message ||
					cmd.commandType === ApplicationCommandType.User
			)
		)
			continue;

		contextCommand.data.setType(contextCommand.commandType);
		collection.set(contextCommand.data.name, contextCommand);
	}

	return collection;
}

async function registerDirectory(client: TriviousClient, parentDir: string) {
	const entries = await fs.readdir(parentDir, { withFileTypes: true });
	const subdirectories = entries.filter((entry) => entry.isDirectory());

	const indexFile = path.resolve(parentDir, "index.js");
	const slashCommand = await parseSlashCommand(indexFile, parentDir, subdirectories);
	if (slashCommand) {
		if (client.stores.commands.chatInput.has(slashCommand.data.name))
			console.warn(
				`[Trivious] SlashCommand '${slashCommand.data.name}' has a duplicate and has been overridden`
			);

		client.stores.commands.chatInput.set(slashCommand.data.name, slashCommand);
	}

	const contextCommands = await parseContextCommands(parentDir);
	contextCommands.forEach((cmd) => client.stores.commands.context.set(cmd.data.name, cmd));
}

export default async function registerCommands(client: TriviousClient, directory: string) {
	if (!existsSync(directory))
		throw new TriviousError(
			`Could not register commands; passed directory '${directory}' does not exist!`,
			"Nonexistant directory passed"
		);

	const processedDirectories = new Set<string>();

	const files = fs.glob(join(directory, "**/*.js"));
	for await (const file of files) {
		const parentDir = path.dirname(file);

		if (processedDirectories.has(parentDir)) continue;
		processedDirectories.add(parentDir);

		await registerDirectory(client, parentDir);
	}
}
