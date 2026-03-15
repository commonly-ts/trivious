import { TriviousClient } from "#typings";
import { ClientEvents } from "discord.js";

export interface Event<K extends keyof ClientEvents = keyof ClientEvents> {
	name: K;
	once?: boolean;
	execute: (client: TriviousClient, ...args: ClientEvents[K]) => Promise<void> | void;
}
