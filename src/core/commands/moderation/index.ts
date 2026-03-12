import { SlashCommandBuilder } from "discord.js";
export default {
	active: true,
	context: "SlashCommand",
	data: new SlashCommandBuilder().setName("moderation").setDescription("Moderation commands"),
};
