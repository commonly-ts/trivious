import { Collection } from "discord.js";
import { exists, resolveUserPath } from "src/shared/utility/functions.js";
import { BaseRegistry, Module } from "src/shared/typings/index.js";
import { promises as fs } from "fs";
import path, { join } from "node:path";
import TriviousClient from "../client/trivious.client.js";

/**
 * Registry to load, get and bind modules.
 *
 * @export
 * @class ModuleRegistry
 * @typedef {ModuleRegistry}
 * @extends {BaseRegistry<Module>}
 */
export default class ModuleRegistry extends BaseRegistry<Module> {
	protected items = new Collection<string, Module>();

	/**
	 * Load all modules.
	 *
	 * @async
	 * @param {string} [directory=getCorePath({ coreDirectory: "module" })]
	 * @returns {Promise<this>}
	 */
	async load(directory: string = resolveUserPath(path.join("src", "modules"))): Promise<this> {
		if (!(await exists(directory))) {
			return this;
		}

		const entries = await fs.readdir(directory, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(directory, entry.name);
			if (!entry.isDirectory()) continue;

			const moduleFiles = (await fs.readdir(fullPath)).filter(
				file =>
					(file.endsWith(".ts") || file.endsWith(".js")) &&
					!file.startsWith("index.") &&
					!file.endsWith(".d.ts")
			);

			for (const file of moduleFiles) {
				const moduleEvent = await this.importFile<Module>(join(fullPath, file));
				if (!moduleEvent || !moduleEvent.events) continue;

				this.items.set(moduleEvent.name, moduleEvent);
			}
		}

		return this;
	}

	/**
	 * Bind all loaded modules to their client event respectively.
	 *
	 * @param {TriviousClient} client
	 */
	bind(client: TriviousClient) {
		for (const mod of this.items.values()) {
			for (const [eventName, handler] of Object.entries(mod.events!)) {
				if (typeof handler !== "function") continue;

				const listener = (...args: unknown[]) => {
					void (handler as (client: TriviousClient, ...args: unknown[]) => any)(client, ...args);
				};

				(client.on as any)(eventName, listener);
			}
		}
	}
}
