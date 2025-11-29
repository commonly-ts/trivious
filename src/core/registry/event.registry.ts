import { ClientEvents, Collection } from "discord.js";
import { exists, getCorePath } from "src/shared/utility/functions.js";
import { BaseRegistry, Event } from "src/shared/typings/index.js";
import { promises as fs } from "fs";
import { join } from "node:path";
import TriviousClient from "../client/trivious.client.js";

export default class EventRegistry extends BaseRegistry<Event> {
	protected items = new Collection<string, Event>();
	async load(directory: string = getCorePath({ coreDirectory: "events" })): Promise<this> {
		if (!(await exists(directory))) {
			return this;
		}

		const files = await fs.readdir(directory);
		for (const file of files) {
			const stat = await fs.lstat(join(directory, file));
			if (stat.isDirectory()) this.load(join(directory, file));
			if (file.endsWith(".js")) {
				const event = await this.importFile(join(directory, file));
				if (!event) continue;

				this.items.set(event.name, event);
			}
		}

		// const entries = await fs.readdir(directory, { withFileTypes: true });

		// for (const entry of entries) {
		// 	const fullPath = join(directory, entry.name);
		// 	if (!entry.isDirectory()) continue;

		// 	const eventFiles = (await fs.readdir(fullPath)).filter(
		// 		file =>
		// 			(file.endsWith(".ts") || file.endsWith(".js")) &&
		// 			!file.startsWith("index.") &&
		// 			!file.endsWith(".d.ts")
		// 	);

		// 	for (const file of eventFiles) {
		// 		const event = await this.importFile(join(fullPath, file));
		// 		if (!event) continue;

		// 		this.items.set(event.name, event);
		// 	}
		// }

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
