import { Collection, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { exists, getCorePath } from "src/shared/utility/functions.js";
import { BaseRegistry, CommandMetadata } from "src/shared/typings/index.js";
import { promises as fs } from "fs";
import { join } from "node:path";

import Command from "../commands/command.base.js";
import Subcommand from "../commands/subcommand.base.js";

export default class CommandRegistry extends BaseRegistry<Command> {
	protected items = new Collection<string, Command>();
	private async importSubcommand(filePath: string): Promise<Subcommand | null> {
		try {
			const { default: subcommand } = (await import(filePath)) as { default: Subcommand };
			if (!subcommand.data.name || !(subcommand.data instanceof SlashCommandSubcommandBuilder))
				return null;
			return subcommand;
		} catch (error: any) {
			console.error(`Failed to load subcommand at ${filePath}:`, error);
			return null;
		}
	}

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

			const command = await this.importFile(commandFile);
			console.log(command, command?.metadata);
			if (!command) continue;
			if (!command.metadata.active) continue;

			if (command.data instanceof SlashCommandBuilder) {
				const subcommandFiles = (await fs.readdir(fullPath)).filter(
					file =>
						(file.endsWith(".ts") || file.endsWith(".js")) &&
						!file.startsWith("index.") &&
						!file.endsWith(".d.ts")
				);

				for (const file of subcommandFiles) {
					const subcommand = await this.importSubcommand(join(fullPath, file));
					if (!subcommand) continue;

					command.data.addSubcommand(subcommand.data);
					(command.metadata as CommandMetadata).subcommands.set(subcommand.data.name, subcommand);
				}
			}

			this.items.set(command.data.name, command);
		}

		console.log(`[Trivious :: CommandRegistry] Loaded ${this.items.size} commands`);
		return this;
	}
}
