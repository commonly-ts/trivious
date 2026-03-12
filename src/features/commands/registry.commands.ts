import { ApplicationCommandType, Collection } from "discord.js";
import { Dirent, promises as fs } from "fs";
import { join } from "path";
import { TriviousError } from "src/shared/utility/errors.js";
import { exists, importFile } from "src/shared/utility/functions.js";
import type TriviousClient from "../client/trivious.client.js";
import type {
	MessageCommandData,
	SlashCommandData,
	SlashSubcommandData,
	SlashSubcommandGroupData,
	UserCommandData,
} from "./commands.types.js";

async function parseSubcommands(
	directory: string,
	collection: Collection<string, SlashSubcommandData>
) {
	const entries = (await fs.readdir(directory)).filter((f) => f.endsWith(".js"));
	for (const entry of entries) {
		if (!entry.endsWith(".js") && entry.startsWith("index")) continue;

		const subcommand = await importFile<SlashSubcommandData>(join(directory, entry));
		if (
			!subcommand ||
			!("context" in subcommand) ||
			subcommand.context !== "SlashSubcommand" ||
			subcommand.commandType !== ApplicationCommandType.ChatInput
		)
			continue;
		if (!subcommand.active || !subcommand.data || !subcommand.execute) continue;

		collection.set(subcommand.data.name, subcommand);
	}

	return collection;
}

export const commandRegistry = {
	registryContext: "commands",
	async parseChatInputCommand(entry: Dirent<string>, fullPath: string) {
		if (!entry.isDirectory()) return null;

		const command = await importFile<SlashCommandData>(join(fullPath, "index.js"));
		if (
			!command ||
			!("context" in command) ||
			!("addSubcommand" in command.data) ||
			command.context !== "SlashCommand" ||
			command.commandType !== ApplicationCommandType.ChatInput
		)
			return null;

		const subcommands = await parseSubcommands(fullPath, new Collection());
		const subcommandGroups = new Collection<string, SlashSubcommandGroupData>();

		const subdirectoryEntries = await fs.readdir(fullPath, { withFileTypes: true });
		for (const subdir of subdirectoryEntries) {
			if (!subdir.isDirectory()) continue;
			const files = (await fs.readdir(join(fullPath, subdir.name))).filter((f) =>
				f.endsWith(".js")
			);
			const indexFile = files.find((f) => f.startsWith("index"));
			if (!indexFile) continue;

			const groupData = await importFile<SlashSubcommandGroupData>(
				join(fullPath, subdir.name, indexFile)
			);
			if (!groupData || !("data" in groupData)) continue;

			if (!groupData.subcommands) groupData.subcommands = new Collection();
			await parseSubcommands(join(fullPath, subdir.name), groupData.subcommands);

			if (groupData.subcommands.size > 0) subcommandGroups.set(groupData.data.name, groupData);
		}

		if (subcommands.size > 0) command.subcommands = subcommands;
		if (subcommandGroups.size > 0) command.subcommandGroups = subcommandGroups;

		return command;
	},

	async parseContextCommand(entry: Dirent<string>, fullPath: string): Promise<UserCommandData | MessageCommandData | null> {
		if (entry.isDirectory()) {
			// return this.parseContextCommand(entry, fullPath);
			return null;
		}

		if (!entry.name.endsWith(".js")) return null;

		const command = await importFile<UserCommandData | MessageCommandData>(
			join(fullPath, entry.name)
		);
		if (!command || !("commandType" in command) || !("setType" in command.data)) return null;
		if (
			!(
				command.commandType === ApplicationCommandType.Message ||
				command.commandType === ApplicationCommandType.User
			)
		)
			return null;

		return command;
	},

	async register(client: TriviousClient, directory: string) {
		if (!(await exists(directory)))
			throw new TriviousError(
				`Could not parse commands; passed directory '${directory}' does not exist!`,
				"Nonexistant directory passed"
			);

		const entries = await fs.readdir(directory, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = join(directory, entry.name);

			const chatInputCommand = await this.parseChatInputCommand(entry, fullPath);
			console.log(chatInputCommand)
			if (chatInputCommand) client.stores.commands.chatInput.set(chatInputCommand.data.name, chatInputCommand);

			const contextCommand = await this.parseContextCommand(entry, fullPath);
			if (contextCommand) {
				const store = (contextCommand.commandType as ApplicationCommandType) === ApplicationCommandType.Message ? client.stores.commands.message : (contextCommand.commandType as ApplicationCommandType) === ApplicationCommandType.User ? client.stores.commands.user : null;
				if (store) store.set(contextCommand.data.name, contextCommand as never);
			}
		}
	},
};
