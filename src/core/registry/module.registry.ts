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

			if (entry.isDirectory()) {
				await this.load(fullPath);
				continue;
			}

			if (entry.isFile() && entry.name.endsWith(".js")) {
				const moduleEvent = await this.importFile<Module>(fullPath);
				if (!moduleEvent || !("events" in moduleEvent && "name" in moduleEvent)) continue;

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
			for (const [moduleName, handler] of Object.entries(mod.events!)) {
				if (typeof handler !== "function") continue;

				const listener = (...args: unknown[]) => {
					void (handler as (client: TriviousClient, ...args: unknown[]) => any)(client, ...args);
				};

				(client.on as any)(moduleName, listener);
			}
		}
	}
}
