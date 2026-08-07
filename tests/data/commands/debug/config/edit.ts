import { createSlashSubcommand } from "#trivious";
import { SlashCommandSubcommandBuilder } from "discord.js";

export default createSlashSubcommand({
	active: true,
	data: new SlashCommandSubcommandBuilder().setName("edit").setDescription("Placeholder"),
	async execute() {},
});
