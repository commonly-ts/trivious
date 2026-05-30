import {
	SlashCommandData,
	SlashSubcommandData,
	SlashSubcommandGroupData,
	TriviousClient,
} from "@typings";
import { beforeAll, describe, expect, it } from "vitest";

describe("Commands Registry", () => {
	let client: TriviousClient;

	let debugCommand: SlashCommandData | undefined;
	let noteCommand: SlashCommandData | undefined;
	let debugConfigGroup: SlashSubcommandGroupData | undefined;
	let pingSubcommand: SlashSubcommandData | undefined;
	let statsSubcommand: SlashSubcommandData | undefined;
	let editSubcommand: SlashSubcommandData | undefined;

	beforeAll(async () => {
		client = new TriviousClient({
			intents: [],
			corePath: "tests/data",
			credentials: {
				clientIdReference: "",
				tokenReference: "",
			},
		});

		await client.register();
		debugCommand = client.stores.commands.chatInput.get("debug");
		noteCommand = client.stores.commands.chatInput.get("note");
		debugConfigGroup = debugCommand?.subcommandGroups?.get("config");
		pingSubcommand = debugCommand?.subcommands?.get("ping");
		statsSubcommand = debugCommand?.subcommands?.get("stats");
		editSubcommand = debugConfigGroup?.subcommands.get("edit");

		console.log(client.stores.commands.chatInput);
	});

	it("should have registered slash commands", () => {
		expect(!!debugCommand).toBe(true);
		expect(!!noteCommand).toBe(true);
	});

	it("should have registered subcommand groups", () => {
		expect(!!debugCommand?.subcommandGroups).toBe(true);
		expect(!!debugConfigGroup).toBe(true);
	});

	it("should have registered subcommands", () => {
		expect(!!debugCommand?.subcommands).toBe(true);
		expect(!!noteCommand?.subcommands).toBe(true);
		expect(!!pingSubcommand).toBe(true);
		expect(!!statsSubcommand).toBe(true);
		expect(!!editSubcommand).toBe(true);
	});
});
