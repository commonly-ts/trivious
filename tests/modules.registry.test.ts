import { Module, TriviousClient } from "#typings";
import path from "path";
import { beforeAll, describe, expect, it } from "vitest";

describe("Modules Registry", () => {
	let client: TriviousClient;
	let exampleModule: Module | undefined;

	beforeAll(async () => {
		client = new TriviousClient({
			intents: [],
			corePath: "tests/data",
			credentials: {
				clientIdReference: "",
				tokenReference: "",
			},
			debug: true,
		});

		await client.registries.modules.register(client, path.resolve(client.trivious.corePath));
		exampleModule = client.stores.modules.get("testModule");
	});

	it("should have registered modules", () => {
		expect(!!exampleModule).toBe(true);
	});
});
