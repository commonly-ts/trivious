import { ApplicationCommandType, SlashCommandSubcommandBuilder } from "discord.js";
import { SlashSubcommandData } from "src/features/commands/commands.types.js";

export default {
	active: true,
	context: "SlashSubcommand",
	commandType: ApplicationCommandType.ChatInput,
	data: new SlashCommandSubcommandBuilder().setName("ban").setDescription("Ban someone!"),

	async execute() {},
} satisfies SlashSubcommandData;
