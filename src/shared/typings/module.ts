import { ClientEvents } from "discord.js";
import TriviousClient from "src/core/client/trivious.client.js";

/**
 * Base Module.
 *
 * @export
 * @interface Module
 * @typedef {Module}
 */
export interface Module {
	/**
	 * The name of the Module.
	 *
	 * @type {string}
	 */
	name: string;
	/**
	 * The events the module is listening for.
	 *
	 * @type {{
	 * 		[K in keyof ClientEvents]?: (
	 * 			client: TriviousClient,
	 * 			...args: ClientEvents[K]
	 * 		) => Promise<void> | void;
	 * 	}}
	 */
	events?: {
		[K in keyof ClientEvents]?: (
			client: TriviousClient,
			...args: ClientEvents[K]
		) => Promise<void> | void;
	};
}
