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

	async loadAll() {
		await Promise.all([
			this.commands.load(),
			this.components.load(),
			this.events.load(),
			this.modules.load(),
		]);
	},

	bind(client: TriviousClient) {
		this.events.bind(client);
		this.modules.bind(client);
	},
});
