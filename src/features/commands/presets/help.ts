import { createEmbed, createMessageCommand } from "#trivious";
import { inlineCode } from "discord.js";
import { formatAliases, formatArguments, resolveCommand } from "../utility.js";

export default createMessageCommand({
	active: true,
	name: "help",
	description: "View information about a message command",
	aliases: ["h"],
	arguments: [
		{ name: "command-name", dataType: "text", description: "Name or alias of a command" },
	],
	async execute(client, interaction) {
		const { args, message } = interaction;
		const query = args.get("command-name")?.trim().toLowerCase();

		if (!query) {
			await message.reply({ content: "Please specify a command name or alias." });
			return;
		}

		const command = resolveCommand(client, query);
		if (!command) {
			await message.reply({
				content: `Could not find command or alias '${query}'`,
			});
			return;
		}

		const prefix = client.trivious.messageCommands?.prefix ?? "?";
		const aliases = formatAliases(prefix, command.aliases);
		const argumentsList = formatArguments(command.arguments);
		const embed = createEmbed({
			title: `${prefix}${command.name}`,
			description: `${command.description}\n${inlineCode(command.metadata.usage)}${aliases}${argumentsList}`,
		});

		await message.reply({ embeds: [embed] });
	},
});
