import { Collection } from "discord.js";
import { BaseRegistry, Component } from "src/shared/typings/index.js";
import { exists, resolveUserPath } from "src/shared/utility/functions.js";
import { promises as fs } from "fs";
import path, { join } from "node:path";

/**
 * Registry to load and get all components.
 *
 * @export
 * @class ComponentRegistry
 * @typedef {ComponentRegistry}
 * @extends {BaseRegistry<Component>}
 */
export default class ComponentRegistry extends BaseRegistry<Component> {
	protected items = new Collection<string, Component>();

	/**
	 * Load all components.
	 *
	 * @async
	 * @param {string} [directory=getCorePath({ coreDirectory: "events" })]
	 * @returns {Promise<this>}
	 */
	async load(directory: string = resolveUserPath(path.join("src", "events"))): Promise<this> {
		if (!(await exists(directory))) return this;

		const entries = await fs.readdir(directory, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = join(directory, entry.name);

			if (entry.isDirectory()) {
				await this.load(fullPath);
				continue;
			}

			if (entry.isFile() && entry.name.endsWith(".js")) {
				const event = await this.importFile<Component>(fullPath);
				if (!event) continue;

				if (!event.customId || !event.customIdData) {
					console.error(`Component from ${entry.name} does not return customId nor customIdData!`);
					continue;
				}

				this.items.set(event.customId || event.customIdData, event);
			}
		}

		return this;
	}
}
