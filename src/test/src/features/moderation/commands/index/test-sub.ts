import { SlashCommandSubcommandBuilder } from "discord.js";
export default {
	active: true,
	context: "SlashSubcommand",
	data: new SlashCommandSubcommandBuilder().setName("ban").setDescription("Ban someone!"),

	async execute() {},
};
