import { createUserContextCommand } from "@src/index.js";
import { ContextMenuCommandBuilder } from "discord.js";

export default createUserContextCommand({
	active: true,
	data: new ContextMenuCommandBuilder().setName("user-context"),
	async execute() {},
});
