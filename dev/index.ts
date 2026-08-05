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
	commandHashConfig: {
		enabled: true,
		persistentDataPath: "data",
	},
	messageCommandPrefix: "?",
	debug: true,
});

(async () => {
	await client.start();
})();
