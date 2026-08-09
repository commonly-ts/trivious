import { createSlashSubcommand } from "#trivious";
import { SlashCommandSubcommandBuilder } from "discord.js";
import noteCommand from "./note.js";

export default createSlashSubcommand({
	active: true,
	data: new SlashCommandSubcommandBuilder().setName("add").setDescription("Placeholder"),
	async execute() {},
	parent: noteCommand,
});
