import type { ClientEvents } from "discord.js";
import type { TriviousClient } from "#typings";

export interface Module {
	name: string;
	events: {
		[K in keyof ClientEvents]?: (client: TriviousClient, ...args: ClientEvents[K]) => Promise<void>;
	};
}
