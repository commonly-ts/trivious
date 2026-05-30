import { createSlashSubcommandGroup } from "@src/index.js";
import { SlashCommandSubcommandGroupBuilder } from "discord.js";

export default createSlashSubcommandGroup({
	data: new SlashCommandSubcommandGroupBuilder().setName("config"),
});
