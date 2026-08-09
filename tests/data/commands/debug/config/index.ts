import { createSlashSubcommandGroup } from "#trivious";
import { SlashCommandSubcommandGroupBuilder } from "discord.js";

export default createSlashSubcommandGroup({
	data: new SlashCommandSubcommandGroupBuilder().setName("config").setDescription("Placeholder"),
});
