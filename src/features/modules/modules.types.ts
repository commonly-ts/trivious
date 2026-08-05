import { TriviousClient } from "#typings";
import { ClientEvents } from "discord.js";

export interface Module {
	name: string;
	events: {
		[K in keyof ClientEvents]?: (client: TriviousClient, ...args: ClientEvents[K]) => Promise<void>;
	};
}
