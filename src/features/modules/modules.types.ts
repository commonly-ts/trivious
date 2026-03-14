import type { TriviousClient } from "#typings";
import type { ClientEvents } from "discord.js";

export interface Module {
	name: string;
	events: {
		[K in keyof ClientEvents]?: (client: TriviousClient, ...args: ClientEvents[K]) => Promise<void>;
	};
}
