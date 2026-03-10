import { Collection } from "discord.js";
import { promises as fs } from "fs";
import { join } from "path";
import { exists, importFile } from "src/shared/utility/functions.js";
import {
	SlashCommandData,
	SlashSubcommandData,
	SlashSubcommandGroupData,
} from "./commands.types.js";

async function parseSubcommands(
	directory: string,
	collection?: Collection<string, SlashSubcommandData>
) {
	collection = collection || new Collection();

	const entries = (await fs.readdir(directory)).filter((f) => f.endsWith(".js"));
	for (const entry of entries) {
		if (!entry.endsWith(".js") && entry.startsWith("index")) continue;

		const subcommand = await importFile<SlashSubcommandData>(join(directory, entry));
		if (!subcommand || !("context" in subcommand) || subcommand.context !== "SlashSubcommand")
			continue;
		if (!subcommand.active || !subcommand.data || !subcommand.execute) continue;

		collection.set(subcommand.data.name, subcommand);
	}

	return collection;
}

export const registry = {
	async parse(directory: string) {
		if (!(await exists(directory))) return;

		const commands = new Collection<string, SlashCommandData>();

		const entries = await fs.readdir(directory, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = join(directory, entry.name);
			if (!entry.isDirectory()) continue;

			const command = await importFile<SlashCommandData>(join(fullPath, "index.js"));
			if (
				!command ||
				!("context" in command) ||
				!("addSubcommand" in command.data) ||
				command.context !== "SlashCommand"
			)
				continue;

			const subcommands = await parseSubcommands(fullPath);
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

				subcommandGroups.set(groupData.data.name, groupData);
			}

			if (subcommands.size > 0) command.subcommands = subcommands;
			if (subcommandGroups.size > 0) command.subcommandGroups = subcommandGroups;
			commands.set(command.data.name, command);
		}

		return commands;
	},
};
