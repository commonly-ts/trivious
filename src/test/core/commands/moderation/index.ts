import { ApplicationCommandType, SlashCommandBuilder } from "discord.js";
import { SlashCommandData } from "src/features/commands/commands.types.js";

export default {
	active: true,
	context: "SlashCommand",
	commandType: ApplicationCommandType.ChatInput,
	data: new SlashCommandBuilder().setName("moderation").setDescription("Moderation commands"),
} satisfies SlashCommandData;
