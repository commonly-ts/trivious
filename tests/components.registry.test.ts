import { Component, TriviousClient } from "#typings";
import path from "path";
import { beforeAll, describe, expect, it } from "vitest";

describe("Components Registry", () => {
	let client: TriviousClient;

	let buttonComponent: Component | undefined;
	let modalComponent: Component | undefined;
	let selectMenuComponent: Component | undefined;

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

		await client.registries.components.register(client, path.resolve(client.trivious.corePath));
		buttonComponent = client.stores.components.get("button");
		modalComponent = client.stores.components.get("modal");
		selectMenuComponent = client.stores.components.get("selectMenu");
	});

	it("should have registered button component", () => {
		expect(!!buttonComponent).toBe(true);
	});

	it("should have registered modal component", () => {
		expect(!!modalComponent).toBe(true);
	});
	it("should have registered selectMenu component", () => {
		expect(!!selectMenuComponent).toBe(true);
	});
});
