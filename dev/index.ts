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
	messageCommandPrefix: "?",
	debug: true,
});

(async () => {
	await client.register();
	// await client.start(false);
})();
