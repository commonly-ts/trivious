import { Event } from "#typings";
import { BitField, GatewayIntentBits } from "discord.js";

export default {
	name: "messageCreate",
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
	async execute(client, message) {
		const prefix = client.trivious.messageCommandPrefix;
		if (!prefix)
			return client.logger.warn(
				"At least one message command is registered, but no command prefix is configured. Ensure the TriviousClient has 'messageCommandPrefix' set to a string value."
			);

		if (!message.content.startsWith(prefix)) return;
		const [commandName, ...rawArgs] = message.content.slice(prefix.length).split(" ");
		const alias = client.stores.messageCommandAlises.get(commandName.toLowerCase()) || "";
		const command =
			client.stores.commands.message.get(commandName.toLowerCase()) ||
			client.stores.commands.message.get(alias);

		if (!command || !command.active)
			return void (await message.reply({
				content: `Invalid command; does not exist, missing handler, or is inactive.`,
			}));

		const expectedArgs = command.arguments?.length || 0;
		if (rawArgs.length < expectedArgs && command.arguments) {
			return void (await message.reply({
				content: `Missing or incomplete arguments. I expected ${expectedArgs} arguments, but received only ${rawArgs.length}.\nNext missing argument is '${command.arguments[rawArgs.length]}'`,
			}));
		}
		const args = command.arguments
			? new Map(
					command.arguments.slice(0, expectedArgs).map((name, index) => [name, rawArgs[index]])
				)
			: null;
		await command.execute(client, message, args);
	},
} satisfies Event<"messageCreate">;
