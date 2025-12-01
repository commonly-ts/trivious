import { Event } from "src/shared/typings/events.js";

export default {
	name: "clientReady",
	execute: async (client, _) => {
		console.log(`Successfully logged into ${client.user?.username}`);
	},
} satisfies Event<"clientReady">;
