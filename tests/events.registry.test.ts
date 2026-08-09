import { Event, TriviousClient } from "#typings";
import { GatewayIntentBits } from "discord.js";
import path from "path";
import { beforeAll, describe, expect, it } from "vitest";

describe("Events Registry", () => {
	let client: TriviousClient;

	let event: Event | undefined;
	let eventOnce: Event | undefined;
	let interactionCreate: Event | undefined;
	let clientReady: Event | undefined;
	let messageCreate: Event | undefined;

	beforeAll(async () => {
		client = new TriviousClient({
			intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
			corePath: "tests/data",
			credentials: {
				clientIdReference: "",
				tokenReference: "",
			},
			debug: true,
		});

		// pass preset event conditions
		client.stores.commands.chatInput.set("00", {} as any);
		client.stores.commands.message.set("00", {} as any);

		await client.registries.events.register(client, path.resolve(client.trivious.corePath));
		event = client.stores.events.get("applicationCommandPermissionsUpdate");
		eventOnce = client.stores.events.get("autoModerationRuleCreate");
		interactionCreate = client.stores.events.get("interactionCreate");
		clientReady = client.stores.events.get("clientReady");
		messageCreate = client.stores.events.get("messageCreate");
	});

	it("should have registered events", () => {
		expect(!!event).toBe(true);
		expect(!!eventOnce).toBe(true);
		expect(eventOnce?.once).toBe(true);
	});

	it("should have registered preset events", () => {
		expect(!!interactionCreate).toBe(true);
		expect(!!clientReady).toBe(true);
		expect(!!messageCreate).toBe(true);
	});
});
