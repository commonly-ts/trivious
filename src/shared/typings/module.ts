import { ClientEvents } from "discord.js";
import TriviousClient from "src/core/client/trivious.client.js";

export interface Module {
	name: string;
	events: {
		[K in keyof ClientEvents]?: (
			client: TriviousClient,
			...args: ClientEvents[K]
		) => Promise<void> | void;
	};
}
