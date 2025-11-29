import { Collection } from "discord.js";
import { exists, FRAMEWORK_ROOT } from "src/shared/utility/functions.js";
import { BaseRegistry } from "src/shared/typings/index.js";
import { promises as fs } from "fs";
import { join } from "node:path";
import Component from "../components/component.base.js";

export default class ComponentRegistry extends BaseRegistry<Component> {
	protected items = new Collection<string, Component>();
	protected async importFile(filePath: string): Promise<Component | null> {
		try {
			this.clearCache(filePath);

			const imported = await import(filePath);
			const component: Component = imported.default ?? imported;

			if (!component.metadata.customId) return null;
			return component;
		} catch (error: any) {
			console.error(`Failed to load component at ${filePath}:`, error);
			return null;
		}
	}

	async load(directory: string = join(FRAMEWORK_ROOT, "components")): Promise<this> {
		if (!await exists(directory)) {
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
				const component = await this.importFile(join(fullPath, file));
				if (!component) continue;

				this.items.set(component.metadata.customId, component);
			}
		}

		console.log(`[Trivious :: ComponentRegistry] Loaded ${this.items.size} components`);
		return this;
	}
}
