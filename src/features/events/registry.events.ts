import { Event, TriviousClient } from "#typings";
import { TriviousError } from "#utility/errors.js";
import { importFile } from "#utility/functions.js";
import { ClientEvents } from "discord.js";
import { existsSync, promises as fs } from "fs";
import path, { join } from "path";

async function loadPresetEvents(client: TriviousClient) {
	const directory = path.resolve(import.meta.dirname, "presets");
	if (!existsSync(directory)) return;

	const files = fs.glob(join(directory, "*.{js,ts}"));
	for await (const file of files) {
		const event = await parseEvent(file);
		if (!event) continue;
		if (
			event.conditions &&
			!event.conditions(client).every(([isValid, description], index) => {
				if (!isValid)
					client.logger.debug(
						"[EVENT REGISTRY]",
						`Condition #${index + 1} "${description}" for event`,
						event.name,
						"not met; this event will not be triggered."
					);
				return isValid;
			})
		) {
			continue;
		}
		client.stores.events.set(event.name, event);
		client.logger.debug("Registered event:", event.name);
	}
}

async function parseEvent(file: string) {
	const event = await importFile<Event>(file);
	if (!event || !("name" in event && "execute" in event) || "context" in event) return null;
	return event;
}

export async function bindEvents(client: TriviousClient) {
	for (const event of client.stores.events.values()) {
		const handler = (...args: ClientEvents[typeof event.name]) =>
			void event.execute(client, ...args);

		if (event.once) client.once(event.name, handler);
		else client.on(event.name, handler);
	}
}

export default async function registerEvents(client: TriviousClient, directory: string) {
	client.logger.debug("Starting event registration in:", directory);
	if (!existsSync(directory))
		throw new TriviousError(
			`Could not register events; passed directory '${directory}' does not exist!`,
			"Nonexistant directory passed"
		);

	await loadPresetEvents(client);
	const files = fs.glob(join(directory, "**/*.{js,ts}"));
	for await (const file of files) {
		const event = await parseEvent(file);
		if (!event) continue;

		if (client.stores.events.get(event.name))
			console.warn(`[Trivious] Event '${event.name}' has a duplicate and has been overridden`);

		client.logger.debug("Registered event:", event.name);
		client.stores.events.set(event.name, event);
	}
}
