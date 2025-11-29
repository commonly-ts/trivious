import { Collection } from "discord.js";
import { exists, getCorePath } from "src/shared/utility/functions.js";
import { BaseRegistry, Module } from "src/shared/typings/index.js";
import { pathToFileURL } from "node:url";
import { promises as fs } from "fs";
import { join } from "node:path";
import TriviousClient from "../client/trivious.client.js";

export default class ModuleRegistry extends BaseRegistry<Module> {
	protected items = new Collection<string, Module>();

	protected async importFile(filePath: string): Promise<Module | null> {
		try {
			this.clearCache(filePath);

			const { default: imports } = (await import(pathToFileURL(filePath).href)) as {
				default: { default: new () => Module };
			};
			const importedClass = imports.default as new () => Module;
			return new importedClass();
		} catch (error: any) {
			console.error(error);
			return null;
		}
	}

	async load(directory: string = getCorePath({ coreDirectory: "module" })): Promise<this> {
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
				const moduleEvent = await this.importFile(join(fullPath, file));
				if (!moduleEvent) continue;

				this.items.set(moduleEvent.name, moduleEvent);
			}
		}

		console.log(`[Trivious :: ModuleRegistry] Loaded ${this.items.size} modules`);
		return this;
	}

	bind(client: TriviousClient) {
		for (const mod of this.items.values()) {
			for (const [eventName, handler] of Object.entries(mod.events)) {
				if (typeof handler !== "function") continue;

				const listener = (...args: unknown[]) => {
					void (handler as (client: TriviousClient, ...args: unknown[]) => any)(client, ...args);
				};

				(client.on as any)(eventName, listener);
			}
		}
	}
}
