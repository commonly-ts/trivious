import { createSlashSubcommand } from "#src/index.js";
import { SlashCommandSubcommandBuilder } from "discord.js";

export default createSlashSubcommand({
	active: true,
	data: new SlashCommandSubcommandBuilder().setName("edit").setDescription("Placeholder"),
	async execute() {},
});
