import registerCommands from "@feature/commands/registry.commands.js";
import registerComponents from "@feature/components/registry.components.js";
import registerEvents, { bindEvents } from "@feature/events/registry.events.js";
import registerModules, { bindModules } from "@feature/modules/registry.modules.js";

export default {
	commands: {
		register: registerCommands,
	},
	components: {
		register: registerComponents,
	},
	events: {
		register: registerEvents,
		bind: bindEvents,
	},
	modules: {
		register: registerModules,
		bind: bindModules,
	},
} as const;
