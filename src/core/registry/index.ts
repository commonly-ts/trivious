import { TriviousClientOptions } from "src/shared/typings/client.js";
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
		await Promise.all([
			this.commands.load(options.corePaths.commandsPath),
			this.components.load(options.corePaths.componentsPath),
			this.events.load(options.corePaths.eventsPath),
			this.modules.load(options.corePaths.modulesPath),
		]);
	},

	bind(client: TriviousClient) {
		this.events.bind(client);
		this.modules.bind(client);
	},
});
