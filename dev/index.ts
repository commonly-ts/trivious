import { TriviousClient } from "#typings";
import { GatewayIntentBits } from "discord.js";

const client = new TriviousClient({
	corePath: "tests/data",
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
	credentials: {
		clientIdReference: "CLIENT_ID",
		tokenReference: "BOT_TOKEN",
	},
	messageCommands: {
		prefix: "?",
		// delimiter: ['"', "#"],
	},
	debug: true,
});

(async () => {
	// await client.register();
	// console.log(client.stores.commands.message);
	await client.start(false);
})();
