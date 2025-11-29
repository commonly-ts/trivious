import { TriviousClientOptions } from "src/shared/typings/client.js";
import { resolveUserPath } from "src/shared/utility/functions.js";
import TriviousClient from "../client/trivious.client.js";
import CommandRegistry from "./command.registry.js";
import ComponentRegistry from "./component.registry.js";
import EventRegistry from "./event.registry.js";
import ModuleRegistry from "./module.registry.js";

export const registries = () => ({
	commands: new CommandRegistry(),
	components: new ComponentRegistry(),
	events: new EventRegistry(),
	modules: new ModuleRegistry(),

	async loadAll(options: TriviousClientOptions) {
		const corePaths = options.corePaths;

		await Promise.all([
			this.commands.load(corePaths.commandsPath ? resolveUserPath(corePaths.commandsPath) : undefined),
			this.components.load(corePaths.componentsPath ? resolveUserPath(corePaths.componentsPath) : undefined),
			this.events.load(corePaths.eventsPath ? resolveUserPath(corePaths.eventsPath) : undefined),
			this.modules.load(corePaths.modulesPath ? resolveUserPath(corePaths.modulesPath) : undefined),
		]);
	},

	bind(client: TriviousClient) {
		this.events.bind(client);
		this.modules.bind(client);
	},
});
