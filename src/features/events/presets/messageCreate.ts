import { canMemberRunCommand } from "#feature/permissions/methods.permissions.js";
import { Event, MessageCommandData, TriviousClient } from "#typings";
import {
	BitField,
	Collection,
	GatewayIntentBits,
	Message,
	OmitPartialGroupDMChannel,
} from "discord.js";

async function doPermissionsCheck(
	client: TriviousClient,
	command: MessageCommandData,
	message: OmitPartialGroupDMChannel<Message<boolean>>
): Promise<boolean> {
	const [hasPermission, reason] = canMemberRunCommand(
		client,
		command,
		message.member || message.author
	);
	if (!hasPermission) {
		await message.reply({
			content: `You do not have permission to run this command: ${reason}`,
		});
		return false;
	}
	return true;
}

async function doArgumentChecks(
	command: MessageCommandData,
	rawArgs: string[],
	message: OmitPartialGroupDMChannel<Message<boolean>>
) {
	const expectedArgs = command.arguments?.length || 0;
	if (rawArgs.length < expectedArgs && command.arguments) {
		return void (await message.reply({
			content: `Missing or incomplete arguments. I expected ${expectedArgs} arguments, but received only ${rawArgs.length}.\nNext missing argument is '${command.arguments[rawArgs.length]}'`,
		}));
	}
}

async function doCommandFlagChecks(
	command: MessageCommandData,
	message: OmitPartialGroupDMChannel<Message<boolean>>
): Promise<void> {
	if (!command.flags) return;
	if ("InGuild" in command.flags && !message.member)
		return void (await message.reply({
			content: "This command can only be ran inside a guild!",
		}));
	if ("OutGuild" in command.flags && message.member)
		return void (await message.reply({
			content: "This command **cannot** be ran inside a guild!",
		}));
}

async function getCommand(
	client: TriviousClient,
	commandName: string,
	message: OmitPartialGroupDMChannel<Message<boolean>>
): Promise<MessageCommandData<true> | null> {
	let command = client.stores.commands.message.get(commandName.toLowerCase());
	if (!command) {
		const mappedCommandName = client.stores.messageCommandAlises.get(commandName.toLowerCase());
		command = mappedCommandName ? client.stores.commands.message.get(mappedCommandName) : undefined;
	}

	if (!command || !command.active) {
		await message.reply({
			content: `Invalid command; does not exist, missing handler, or is inactive.`,
		});
		return null;
	}
	return command;
}

export default {
	name: "messageCreate",
	async execute(client, message) {
		const config = client.trivious.messageCommands;
		if (!config)
			return client.logger.warn(
				"At least one message command is registered, but message commands have not been configured in the TriviousClient."
			);
		const { prefix } = config;
		if (!message.content.startsWith(prefix)) return;
		const input = message.content.slice(prefix.length);
		const [commandName] = input.split(" ");

		const command = await getCommand(client, commandName, message);
		if (!command) return;
		const hasPermission = await doPermissionsCheck(client, command, message);
		if (!hasPermission) return;
		await doCommandFlagChecks(command, message);

		let args: Collection<string, string> | null = null;
		if (command.arguments) {
			const result = input.match(command.regex);
			if (!result)
				return void (await message.reply({ content: "Failed parsing command arguments" }));
			const matches = result.slice(1, command.arguments.length + 1);
			args = new Collection(
				matches.map((value, index) => [command.arguments![index]!.name, value])
			);
		}

		await command.execute(client, { message, command, args });
	},
	conditions(client) {
		return [
			[client.stores.commands.message.size > 0, "At least one (1) message command registered."],
			[
				new BitField(client.trivious.intents).has(GatewayIntentBits.MessageContent),
				"TriviousClient has MessageContent gateway intent.",
			],
			[
				new BitField(client.trivious.intents).has(GatewayIntentBits.GuildMessages),
				"TriviousClient has GuildMessages gateway intent.",
			],
		];
	},
} satisfies Event<"messageCreate">;
