import { createSlashSubcommand } from "#src/index.js";
import { SlashCommandSubcommandBuilder } from "discord.js";
import noteCommand from "./note.js";

export default createSlashSubcommand({
	active: true,
	data: new SlashCommandSubcommandBuilder().setName("add"),
	async execute() {},
	parent: noteCommand,
});
