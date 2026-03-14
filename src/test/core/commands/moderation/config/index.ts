import { Collection, SlashCommandSubcommandGroupBuilder } from "discord.js";
import { SlashSubcommandGroupData } from "src/features/commands/commands.types.js";

export default {
	data: new SlashCommandSubcommandGroupBuilder()
		.setName("config")
		.setDescription("Moderation config commands"),
	subcommands: new Collection(),
	context: "SlashSubcommandGroup",
} satisfies SlashSubcommandGroupData;
