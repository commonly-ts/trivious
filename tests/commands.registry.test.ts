import registerCommands from "#feature/commands/registry.commands.js";
import {
	ContextCommandData,
	SlashCommandData,
	SlashSubcommandData,
	SlashSubcommandGroupData,
	TriviousClient,
} from "#typings";
import path from "path";
import { beforeAll, describe, expect, it } from "vitest";

describe("Commands Registry", () => {
	let client: TriviousClient;

	let debugCommand: SlashCommandData | undefined;
	let noteCommand: SlashCommandData | undefined;
	let debugConfigGroup: SlashSubcommandGroupData | undefined;
	let pingSubcommand: SlashSubcommandData | undefined;
	let statsSubcommand: SlashSubcommandData | undefined;
	let editSubcommand: SlashSubcommandData | undefined;
	let messageContextCommand: ContextCommandData | undefined;
	let userContextCommand: ContextCommandData | undefined;

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

		await registerCommands(client, path.resolve(client.trivious.corePath));
		debugCommand = client.stores.commands.chatInput.get("debug");
		noteCommand = client.stores.commands.chatInput.get("note");
		debugConfigGroup = debugCommand?.subcommandGroups?.get("config");
		pingSubcommand = debugCommand?.subcommands?.get("ping");
		statsSubcommand = debugCommand?.subcommands?.get("stats");
		editSubcommand = debugConfigGroup?.subcommands.get("edit");
		messageContextCommand = client.stores.commands.context.get("message-context");
		userContextCommand = client.stores.commands.context.get("user-context");
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

	it("should have registered context menu commands", () => {
		expect(!!messageContextCommand).toBe(true);
		expect(!!userContextCommand).toBe(true);
	});
});
