import registerModules from "@feature/modules/registry.modules.js";
import structure from "@feature/structure/index.structure.js";
import { Module, TriviousClient } from "@typings";
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

		await registerModules(client, structure.resolveRelativePath(client.trivious.corePath));
		exampleModule = client.stores.modules.get("testModule");
	});

	it("should have registered modules", () => {
		expect(!!exampleModule).toBe(true);
	});
});
