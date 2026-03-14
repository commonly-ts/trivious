import type { ClientEvents } from "discord.js";
import type { TriviousClient } from "#typings";

export interface Event<K extends keyof ClientEvents = keyof ClientEvents> {
	name: K;
	once?: boolean;
	execute: (client: TriviousClient, ...args: ClientEvents[K]) => Promise<void> | void;
}
