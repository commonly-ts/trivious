import { ApplicationCommandType, SlashCommandSubcommandBuilder } from "discord.js";
import { SlashSubcommandData } from "src/features/commands/commands.types.js";

export default {
	active: true,
	context: "SlashSubcommand",
	commandType: ApplicationCommandType.ChatInput,
	data: new SlashCommandSubcommandBuilder()
		.setName("ban-message")
		.setDescription("Ban message config"),

	async execute() {},
} satisfies SlashSubcommandData;
