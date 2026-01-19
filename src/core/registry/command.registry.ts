import { Collection, SlashCommandSubcommandBuilder } from "discord.js";
import { BaseRegistry } from "src/shared/typings/index.js";
import { exists, resolveUserPath } from "src/shared/utility/functions.js";
import {
	Command,
	ContextMenuCommand,
	SlashCommand,
	SlashSubcommand,
} from "../commands/command.base.js";
import { promises as fs } from "fs";
import path, { join } from "node:path";

/**
 * Registry to load and get all commands.
 *
 * @export
 * @class CommandRegistry
 * @typedef {CommandRegistry}
 * @extends {BaseRegistry<AnyCommand>}
 */
export default class CommandRegistry extends BaseRegistry<Command> {
	protected items = new Collection<string, Command>();

	/**
	 * Load all commands and their subcommands
	 *
	 * @async
	 * @param {string} [directory=getCorePath({ coreDirectory: "commands" })]
	 * @returns {unknown}
	 */
	async load(directory: string = resolveUserPath(path.join("src", "commands"))) {
		if (!(await exists(directory))) {
			return this;
		}

		const entries = await fs.readdir(directory, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(directory, entry.name);
			if (!entry.isDirectory()) continue;

			const indexFile = join(fullPath, "index.ts");
			const indexJs = join(fullPath, "index.js");

			let commandFile = "";
			if (await exists(indexFile)) commandFile = indexFile;
			else if (await exists(indexJs)) commandFile = indexJs;
			else continue;

			const command = (await this.importFile<Command>(commandFile)) as
				| SlashCommand
				| SlashSubcommand
				| ContextMenuCommand
				| null;
			if (!command || !command.active || !("data" in command)) continue;

			if ("subcommands" in command) {
				const subcommandFiles = (await fs.readdir(fullPath)).filter(
					file =>
						(file.endsWith(".ts") || file.endsWith(".js")) &&
						!file.startsWith("index.") &&
						!file.endsWith(".d.ts")
				);

				for (const file of subcommandFiles) {
					const subcommand = await this.importFile<SlashSubcommand>(join(fullPath, file));
					if (!subcommand) continue;
					if (!subcommand.data.name || !(subcommand.data instanceof SlashCommandSubcommandBuilder))
						continue;

					if (!command.subcommands) command.subcommands = new Collection<string, SlashSubcommand>();
					command.subcommands.set(subcommand.data.name, subcommand);
					command.data.addSubcommand(subcommand.data);
				}
			}

			this.items.set(command.data.name, command);
		}

		return this;
	}
}
