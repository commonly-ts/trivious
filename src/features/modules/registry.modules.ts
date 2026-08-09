import { Module, TriviousClient } from "#typings";
import { TriviousError } from "#utility/errors.js";
import { importFile } from "#utility/functions.js";
import { existsSync, promises as fs } from "fs";
import { join } from "path";

export async function bindModules(client: TriviousClient) {
	for (const moduleData of client.stores.modules.values()) {
		for (const [name, handler] of Object.entries(moduleData.events)) {
			const listener = (...args: unknown[]) =>
				void (handler as (client: TriviousClient, ...args: unknown[]) => any)(client, ...args);

			client.on(name, listener);
		}
	}
}

export default async function registerModules(client: TriviousClient, directory: string) {
	client.logger.debug("Starting module registration in:", directory);
	if (!existsSync(directory))
		throw new TriviousError(
			`Could not register modules; passed directory '${directory}' does not exist!`,
			"Nonexistant directory passed"
		);

	const files = fs.glob(join(directory, "**/*.{js,ts}"));
	for await (const file of files) {
		const moduleData = await importFile<Module>(file);
		if (!moduleData || !("name" in moduleData && "events" in moduleData)) continue;

		if (client.stores.events.get(moduleData.name))
			console.warn(
				`[Trivious] Module '${moduleData.name}' has a duplicate and has been overridden`
			);

		client.stores.modules.set(moduleData.name, moduleData);
	}
}
