import { Collection, SlashCommandSubcommandBuilder } from "discord.js";
import { BaseRegistry, AnyCommand } from "../../shared/typings/index.js";
import { exists, getCorePath } from "../../shared/utility/functions.js";
import { promises as fs } from "fs";
import { join } from "node:path";
import Subcommand from "../commands/subcommand.base.js";

/**
 * Registry to load and get all commands.
 *
 * @export
 * @class CommandRegistry
 * @typedef {CommandRegistry}
 * @extends {BaseRegistry<AnyCommand>}
 */
export default class CommandRegistry extends BaseRegistry<AnyCommand> {
	protected items = new Collection<string, AnyCommand>();

	/**
	 * Load all commands and their subcommands
	 *
	 * @async
	 * @param {string} [directory=getCorePath({ coreDirectory: "commands" })]
	 * @returns {unknown}
	 */
	async load(directory: string = getCorePath({ coreDirectory: "commands" })) {
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

			const command = await this.importFile<AnyCommand>(commandFile);
			if (!command) continue;
			if (!command.metadata.active) continue;

			if (command.isSlashCommand()) {
				const subcommandFiles = (await fs.readdir(fullPath)).filter(
					file =>
						(file.endsWith(".ts") || file.endsWith(".js")) &&
						!file.startsWith("index.") &&
						!file.endsWith(".d.ts")
				);

				for (const file of subcommandFiles) {
					const subcommand = await this.importFile<Subcommand>(join(fullPath, file));
					if (!subcommand) continue;
					if (!subcommand.data.name || !(subcommand.data instanceof SlashCommandSubcommandBuilder))
						continue;

					command.data.addSubcommand(subcommand.data);
					command.metadata.subcommands.set(subcommand.data.name, subcommand);
				}
			}

			this.items.set(command.data.name, command);
		}

		return this;
	}
}
