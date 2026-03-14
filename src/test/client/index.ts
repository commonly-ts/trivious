import { GatewayIntentBits } from "discord.js";
import TriviousClient from "src/features/client/trivious.client.js";

const client = new TriviousClient({
	credentials: {
		clientIdReference: "",
		tokenRefernece: "",
	},
	intents: [GatewayIntentBits.Guilds],
	structurePaths: {
		useTypeBasedStructure: true,
		corePath: "test/core",
	},
});

(async () => {
	await client.register();
})();
