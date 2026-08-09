import {
	BitField,
	Collection,
	GatewayIntentBits,
	inlineCode,
	Message,
	OmitPartialGroupDMChannel,
} from "discord.js";

import { canMemberRunCommand } from "#feature/permissions/methods.permissions.js";
import { parseMessageCommandArgument } from "#trivious";
import { Event, MessageCommandData, TriviousClient } from "#typings";

async function getCommand(
	client: TriviousClient,
	commandName: string,
	message: OmitPartialGroupDMChannel<Message<boolean>>
): Promise<MessageCommandData<true> | null> {
	const nameLower = commandName.toLowerCase();
	let command = client.stores.commands.message.get(nameLower);

	if (!command) {
		const mappedCommandName = client.stores.messageCommandAliases.get(nameLower);
		command = mappedCommandName ? client.stores.commands.message.get(mappedCommandName) : undefined;
	}

	if (!command || !command.active) {
		await message.reply({
			content: "Invalid command; does not exist, missing handler, or is inactive.",
		});
		return null;
	}

	return command;
}

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

async function doCommandFlagChecks(
	command: MessageCommandData,
	message: OmitPartialGroupDMChannel<Message<boolean>>
): Promise<boolean> {
	if (!command.flags) return false;
	if ("InGuild" in command.flags && !message.member) {
		await message.reply({
			content: "This command can only be ran inside a guild!",
		});
		return true;
	}
	if ("OutGuild" in command.flags && message.member) {
		await message.reply({
			content: "This command **cannot** be ran inside a guild!",
		});
		return true;
	}
	return false;
}

export default {
	name: "messageCreate",
	async execute(client, message) {
		const config = client.trivious.messageCommands;
		if (!config) {
			return client.logger.warn(
				"At least one message command is registered, but message commands have not been configured in the TriviousClient."
			);
		}

		const { prefix } = config;
		if (!message.content.startsWith(prefix)) return;

		const input = message.content.slice(prefix.length);
		const [commandName] = input.split(" ");

		const command = await getCommand(client, commandName, message);
		if (!command) return;

		const hasPermission = await doPermissionsCheck(client, command, message);
		if (!hasPermission) return;

		const failedFlagChecks = await doCommandFlagChecks(command, message);
		if (failedFlagChecks) return;

		let args: Collection<string, any> | null = null;
		if (command.arguments) {
			const result = input.match(command.metadata.regex);
			if (!result) {
				await message.reply({
					content: `Incorrect command or missing one or more required arguments.\nExpected usage: ${inlineCode(
						command.metadata.usage
					)}.\n-# Use ${inlineCode(`${prefix}help ${command.name}`)} for more information about this command.`,
				});
				return;
			}

			const matches = result.slice(1, command.arguments.length + 1);
			const rejectedArguments: [string, string][] = [];
			args = new Collection<string, any>();

			matches.forEach((value, index) => {
				const argument = command.arguments![index];
				const [parsedValue, reason] = parseMessageCommandArgument(argument.dataType, value, {
					client,
					name: argument.name,
					guild: message.guild,
				});

				if (!parsedValue) {
					rejectedArguments.push([argument.name, reason!]);
				}

				args!.set(argument.name, parsedValue);
			});

			if (rejectedArguments.length > 0) {
				await message.reply({
					content: `Failed parsing command, one or more arguments were rejected:\n${rejectedArguments
						.map(([name, reason]) => `-# [${name}] ${reason}`)
						.join("\n")}`,
				});
				return;
			}
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
