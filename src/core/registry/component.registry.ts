import { Collection } from "discord.js";
import { exists, getCorePath } from "src/shared/utility/functions.js";
import { BaseRegistry, deconstructCustomId } from "src/shared/typings/index.js";
import { promises as fs } from "fs";
import { join } from "node:path";
import Component from "../components/component.base.js";

export default class ComponentRegistry extends BaseRegistry<Component> {
	protected items = new Collection<string, Component>();

	async load(directory: string = getCorePath({ coreDirectory: "components" })): Promise<this> {
		if (!(await exists(directory))) {
			return this;
		}

		const entries = await fs.readdir(directory, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(directory, entry.name);
			if (!entry.isDirectory()) continue;

			const componentFiles = (await fs.readdir(fullPath)).filter(
				file =>
					(file.endsWith(".ts") || file.endsWith(".js")) &&
					!file.startsWith("index.") &&
					!file.endsWith(".d.ts")
			);

			for (const file of componentFiles) {
				const component = await this.importFile<Component>(join(fullPath, file));
				if (!component) continue;

				const { data } = deconstructCustomId(component.metadata.customId);
				this.items.set(data, component);
			}
		}

		return this;
	}
}
