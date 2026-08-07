import { createMessageContextCommand } from "#trivious";
import { ContextMenuCommandBuilder } from "discord.js";

export default createMessageContextCommand({
	active: true,
	data: new ContextMenuCommandBuilder().setName("message-context"),
	async execute() {},
});
