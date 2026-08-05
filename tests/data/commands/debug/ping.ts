import { createSlashSubcommand, interactionReply } from "#src/index.js";
import { SlashCommandSubcommandBuilder } from "discord.js";

export default createSlashSubcommand({
	active: true,
	data: new SlashCommandSubcommandBuilder().setName("ping").setDescription("Placeholder"),
	async execute(client, interaction) {
		await interactionReply({ interaction, replyPayload: { content: "Hello world" } });
	},
});
