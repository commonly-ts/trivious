import { createSlashSubcommand } from "#src/index.js";
import { SlashCommandSubcommandBuilder } from "discord.js";
import debugCommand from "./debug/index.js";

export default createSlashSubcommand({
	active: true,
	data: new SlashCommandSubcommandBuilder().setName("stats").setDescription("Placeholder"),
	async execute() {},
	parent: debugCommand,
});
