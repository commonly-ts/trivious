import { TriviousClientOptions } from "../../shared/typings/client.js";
import { resolveUserPath } from "../../shared/utility/functions.js";
import TriviousClient from "../client/trivious.client.js";
import CommandRegistry from "./command.registry.js";
import ComponentRegistry from "./component.registry.js";
import EventRegistry from "./event.registry.js";
import ModuleRegistry from "./module.registry.js";
import path from "node:path";

/**
 * Create new registries.
 *
 * @returns {{ commands: CommandRegistry; components: ComponentRegistry; events: EventRegistry; modules: any; loadAll(options: TriviousClientOptions): any; bind(client: TriviousClient): void; }}
 */
export const registries = () => ({
	commands: new CommandRegistry(),
	components: new ComponentRegistry(),
	events: new EventRegistry(),
	modules: new ModuleRegistry(),

	async loadAll(options: TriviousClientOptions) {
		const corePaths = options.corePaths;
		const corePath = options.corePath;

		await Promise.all([
			this.commands.load(
				corePath
					? resolveUserPath(path.join(corePath, "commands"))
					: corePaths?.commandsPath
						? resolveUserPath(corePaths.commandsPath)
						: undefined
			),
			this.components.load(
				corePath
					? resolveUserPath(path.join(corePath, "components"))
					: corePaths?.componentsPath
						? resolveUserPath(corePaths.componentsPath)
						: undefined
			),
			this.events.load(
				corePath
					? resolveUserPath(path.join(corePath, "events"))
					: corePaths?.eventsPath
						? resolveUserPath(corePaths.eventsPath)
						: undefined
			),
			this.modules.load(
				corePath
					? resolveUserPath(path.join(corePath, "modules"))
					: corePaths?.modulesPath
						? resolveUserPath(corePaths.modulesPath)
						: undefined
			),
		]);
	},

	bind(client: TriviousClient) {
		this.events.bind(client);
		this.modules.bind(client);
	},
});
