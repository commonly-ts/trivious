import { promises as fs } from "fs";
import { join } from "path";
import { exists, importFile } from "src/shared/utility/functions.js";

const registry = {
	async registerSlashcommand(directory: string) {

	},

	async registerSlashSubcommand(directory: string) {

	},

	async registerSlashSubcommandGroup(directory: path) {

	},

	async register(directory: string) {
		if (!(await exists(directory))) return;

		const entries = await fs.readdir(directory, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = join(directory, entry.name);
			if (entry.isDirectory()) {
				await this.register(fullPath);
				return;
			}

			try {
				await this.registerSlashSubcommand(fullPath);
				return;
			} catch { };
		}
	}
};
