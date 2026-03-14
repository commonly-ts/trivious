import registerCommands from "src/features/commands/registry.commands.js";
import registerComponents from "src/features/components/registry.components.js";
import registerEvents, { bindEvents } from "src/features/events/registry.events.js";
import registerModules, { bindModules } from "src/features/modules/registry.modules.js";

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
