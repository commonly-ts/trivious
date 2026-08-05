import { Component, ComponentContext, TriviousClient } from "#typings";
import { TriviousError } from "#utility/errors.js";
import { importFile } from "#utility/functions.js";
import { existsSync, promises as fs } from "fs";
import { join } from "path";

export default async function registerComponents(client: TriviousClient, directory: string) {
	client.logger.debug("Starting component registration in:", directory);
	if (!existsSync(directory))
		throw new TriviousError(
			`Could not register components; passed directory '${directory} does not exist!'`,
			"Nonexistant directory passed"
		);

	const files = fs.glob(join(directory, "**/*.{js,ts}"));
	for await (const file of files) {
		const component = await importFile<Component>(file);
		if (
			!component ||
			!(
				("component" in component || "context" in component) &&
				"identifier" in component &&
				"execute" in component
			)
		)
			continue;

		if (client.stores.components.get(component.identifier))
			console.warn(
				`[Trivious] Component identifier '${component.identifier}' with the context '${ComponentContext[component.context]}' has a duplicate and has been overridden`
			);

		client.logger.debug("Registered component:", component.identifier);
		client.stores.components.set(component.identifier, component);
	}
}
