import { ClientEvents } from "discord.js";
import TriviousClient from "src/core/client/trivious.client.js";

export interface Event<K extends keyof ClientEvents = keyof ClientEvents> {
	name: K;
	once?: boolean;
	execute: (client: TriviousClient, ...args: ClientEvents[K]) => Promise<void> | void;
}
