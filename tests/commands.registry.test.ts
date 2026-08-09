import {
	ContextCommandData,
	MessageCommandData,
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

	let helpMessageCommand: MessageCommandData<true> | undefined;
	let helpMessageCommandAlias: string | undefined;
	let testMessageCommand: MessageCommandData<true> | undefined;
	let testMessageCommandAlias: string | undefined;

	beforeAll(async () => {
		client = new TriviousClient({
			intents: [],
			corePath: "tests/data",
			credentials: {
				clientIdReference: "",
				tokenReference: "",
			},
			messageCommands: {
				prefix: "?",
			},
			debug: true,
		});

		await client.registries.commands.register(client, path.resolve(client.trivious.corePath));
		debugCommand = client.stores.commands.chatInput.get("debug");
		noteCommand = client.stores.commands.chatInput.get("note");
		debugConfigGroup = debugCommand?.subcommandGroups?.get("config");
		pingSubcommand = debugCommand?.subcommands?.get("ping");
		statsSubcommand = debugCommand?.subcommands?.get("stats");
		editSubcommand = debugConfigGroup?.subcommands.get("edit");
		messageContextCommand = client.stores.commands.context.get("message-context");
		userContextCommand = client.stores.commands.context.get("user-context");

		helpMessageCommand = client.stores.commands.message.get("help");
		helpMessageCommandAlias = client.stores.messageCommandAliases.get("h");
		testMessageCommand = client.stores.commands.message.get("ping-test");
		testMessageCommandAlias = client.stores.messageCommandAliases.get("pt");
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

	it("should have registered message commands", () => {
		expect(!!helpMessageCommand).toBe(true);
		expect(!!testMessageCommand).toBe(true);
	});

	it("should have registered message command aliases", () => {
		expect(!!helpMessageCommandAlias).toBe(true);
		expect(!!testMessageCommandAlias).toBe(true);
	});
});
