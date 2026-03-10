import { Collection, SlashCommandSubcommandGroupBuilder } from "discord.js";

export default {
	data: new SlashCommandSubcommandGroupBuilder()
		.setName("config")
		.setDescription("Moderation config commands"),
	subcommands: new Collection(),
};
