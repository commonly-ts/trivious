import { TriviousClientOptions } from "src/shared/typings/client.js";
import TriviousClient from "../client/trivious.client.js";
import CommandRegistry from "./command.registry.js";
import ComponentRegistry from "./component.registry.js";
import EventRegistry from "./event.registry.js";
import ModuleRegistry from "./module.registry.js";
import path from "node:path";

export const registries = () => ({
	commands: new CommandRegistry(),
	components: new ComponentRegistry(),
	events: new EventRegistry(),
	modules: new ModuleRegistry(),

	async loadAll(options: TriviousClientOptions) {
		const corePaths = options.corePaths;

		await Promise.all([
			this.commands.load(
				corePaths.commandsPath ? path.join(process.cwd(), corePaths.commandsPath) : undefined
			),
			this.components.load(
				corePaths.componentsPath ? path.join(process.cwd(), corePaths.componentsPath) : undefined
			),
			this.events.load(
				corePaths.eventsPath ? path.join(process.cwd(), corePaths.eventsPath) : undefined
			),
			this.modules.load(
				corePaths.modulesPath ? path.join(process.cwd(), corePaths.modulesPath) : undefined
			),
		]);
	},

	bind(client: TriviousClient) {
		this.events.bind(client);
		this.modules.bind(client);
	},
});
