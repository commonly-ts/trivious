import { createSlashCommand } from "@src/index.js";
import { SlashCommandBuilder } from "discord.js";

export default createSlashCommand({
	active: true,
	data: new SlashCommandBuilder().setName("note"),
});
