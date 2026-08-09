import { Event } from "#typings";

export default {
	name: "clientReady",
	once: true,
	async execute(client) {
		console.log(`Successfully logged into ${client.user?.username}`);
	},
} satisfies Event<"clientReady">;
