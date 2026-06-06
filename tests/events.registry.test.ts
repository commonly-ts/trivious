import registerEvents from "@feature/events/registry.events.js";
import structure from "@feature/structure/index.structure.js";
import { Event, TriviousClient } from "@typings";
import { beforeAll, describe, expect, it } from "vitest";

describe("Events Registry", () => {
	let client: TriviousClient;

	let event: Event | undefined;
	let eventOnce: Event | undefined;
	let interactionCreate: Event | undefined;
	let clientReady: Event | undefined;

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

		await registerEvents(client, structure.resolveRelativePath(client.trivious.corePath));
		event = client.stores.events.get("applicationCommandPermissionsUpdate");
		eventOnce = client.stores.events.get("autoModerationRuleCreate");
		interactionCreate = client.stores.events.get("interactionCreate");
		clientReady = client.stores.events.get("clientReady");
	});

	it("should have registered events", () => {
		expect(!!event).toBe(true);
		expect(!!eventOnce).toBe(true);
		expect(eventOnce?.once).toBe(true);
	});

	it("should have registered preset events", () => {
		expect(!!interactionCreate).toBe(true);
		expect(!!clientReady).toBe(true);
	});
});
