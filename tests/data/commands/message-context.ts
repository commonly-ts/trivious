import { createMessageContextCommand } from "#src/index.js";
import { ContextMenuCommandBuilder } from "discord.js";

export default createMessageContextCommand({
	active: true,
	data: new ContextMenuCommandBuilder().setName("message-context"),
	async execute() {},
});
