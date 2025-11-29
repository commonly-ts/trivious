import { ClientEvents, Collection } from "discord.js";
import { exists, getCorePath } from "src/shared/utility/functions.js";
import { BaseRegistry, Event } from "src/shared/typings/index.js";
import { promises as fs } from "fs";
import { join } from "node:path";
import TriviousClient from "../client/trivious.client.js";

export default class EventRegistry extends BaseRegistry<Event> {
	protected items = new Collection<string, Event>();
	protected async importFile(filePath: string): Promise<Event | null> {
		try {
			this.clearCache(filePath);

			const imported = await import(filePath);
			const event: Event = imported.default ?? imported;

			return event;
		} catch (error: any) {
			console.error(`Failed to load event at ${filePath}:`, error);
			return null;
		}
	}

	async load(directory: string = getCorePath({ coreDirectory: "events" })): Promise<this> {
		if (!(await exists(directory))) {
			return this;
		}

		const entries = await fs.readdir(directory, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(directory, entry.name);
			if (!entry.isDirectory()) continue;

			const eventFiles = (await fs.readdir(fullPath)).filter(
				file =>
					(file.endsWith(".ts") || file.endsWith(".js")) &&
					!file.startsWith("index.") &&
					!file.endsWith(".d.ts")
			);

			for (const file of eventFiles) {
				const event = await this.importFile(join(fullPath, file));
				if (!event) continue;

				this.items.set(event.name, event);
			}
		}

		console.log(`[Trivious :: EventRegistry] Loaded ${this.items.size} events`);
		return this;
	}

	bind(client: TriviousClient) {
		for (const event of this.items.values()) {
			const handler = (...args: ClientEvents[typeof event.name]) =>
				void event.execute(client, ...args);

			if (event.once) client.once(event.name, handler);
			else client.on(event.name, handler);
		}
	}
}
