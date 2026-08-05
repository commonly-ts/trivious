import { TriviousClient } from "#typings";

const client = new TriviousClient({
	corePath: "tests/data",
	intents: [],
	credentials: {
		clientIdReference: "",
		tokenReference: "",
	},
	debug: true,
});

(async () => {
	await client.register();
})();
