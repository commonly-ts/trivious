import { createSlashCommand } from "#trivious";
import { SlashCommandBuilder } from "discord.js";

export default createSlashCommand({
	active: true,
	data: new SlashCommandBuilder().setName("note").setDescription("Placeholder"),
});
