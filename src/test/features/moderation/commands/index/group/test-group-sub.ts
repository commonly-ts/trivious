import { SlashCommandSubcommandBuilder } from "discord.js";

export default {
	active: true,
	context: "SlashSubcommand",
	data: new SlashCommandSubcommandBuilder()
		.setName("ban-message")
		.setDescription("Ban message config"),

	async execute() {},
};
