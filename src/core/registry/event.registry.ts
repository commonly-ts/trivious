import { ClientEvents, Collection } from "discord.js";
import { exists, getCorePath } from "src/shared/utility/functions.js";
import { BaseRegistry, Event } from "src/shared/typings/index.js";
import { promises as fs } from "fs";
import { join } from "node:path";
import TriviousClient from "../client/trivious.client.js";

/**
 * Registry to load, get and bind events.
 *
 * @export
 * @class EventRegistry
 * @typedef {EventRegistry}
 * @extends {BaseRegistry<Event>}
 */
export default class EventRegistry extends BaseRegistry<Event> {
	protected items = new Collection<string, Event>();

	/**
	 * Load all preset events, can be overridden by user-provided events.
	 *
	 * @async
	 * @protected
	 * @returns {Promise<this>}
	 */
	protected async loadPresetEvents() {
		const directory = join(__dirname, "../events");
		const entries = await fs.readdir(directory, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = join(directory, entry.name);
			if (!entry.isFile() || !entry.name.endsWith(".js")) continue;

			const event = await this.importFile<Event>(fullPath);
			if (!event) continue;

			if (this.items.has(event.name)) continue;
			this.items.set(event.name, event);
		}

		return this;
	}

	/**
	 * Load all events.
	 *
	 * @async
	 * @param {string} [directory=getCorePath({ coreDirectory: "events" })]
	 * @returns {Promise<this>}
	 */
	async load(directory: string = getCorePath({ coreDirectory: "events" })): Promise<this> {
		if (!(await exists(directory))) return this;

		const entries = await fs.readdir(directory, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = join(directory, entry.name);

			if (entry.isDirectory()) {
				await this.load(fullPath);
				continue;
			}

			if (entry.isFile() && entry.name.endsWith(".js")) {
				const event = await this.importFile<Event>(fullPath);
				if (!event) continue;

				this.items.set(event.name, event);
			}
		}

		await this.loadPresetEvents();
		return this;
	}

	/**
	 * Bind loaded events to their client events respectively.
	 *
	 * @param {TriviousClient} client
	 */
	bind(client: TriviousClient) {
		for (const event of this.items.values()) {
			const handler = (...args: ClientEvents[typeof event.name]) =>
				void event.execute(client, ...args);

			if (event.once) client.once(event.name, handler);
			else client.on(event.name, handler);
		}
	}
}
