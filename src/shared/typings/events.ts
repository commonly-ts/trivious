import { ClientEvents } from "discord.js";
import TriviousClient from "src/core/client/trivious.client.js";

/**
 * Base Event.
 *
 * @export
 * @interface Event
 * @typedef {Event}
 * @template {keyof ClientEvents} [K=keyof ClientEvents]
 */
export interface Event<K extends keyof ClientEvents = keyof ClientEvents> {
	/**
	 * Name of the ClientEvent.
	 *
	 * @type {K}
	 */
	name: K;
	/**
	 * Whether the event is once.
	 *
	 * @type {?boolean}
	 */
	once?: boolean;
	/**
	 * Execute the event.
	 *
	 * @type {(client: TriviousClient, ...args: ClientEvents[K]) => Promise<void> | void}
	 */
	execute: (client: TriviousClient, ...args: ClientEvents[K]) => Promise<void> | void;
}
