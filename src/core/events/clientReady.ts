import { Event } from "src/shared/typings/index.js";

export default {
	name: "clientReady",
	execute: async (client, _) => {
		console.log(`Successfully logged into ${client.user?.username}`);
	},
} satisfies Event<"clientReady">;
