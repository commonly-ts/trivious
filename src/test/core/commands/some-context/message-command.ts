import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { MessageCommandData } from "src/features/commands/commands.types.js";

export default {
	active: true,
	commandType: ApplicationCommandType.Message,
	data: new ContextMenuCommandBuilder().setName("message-context"),

	async execute() {},
} satisfies MessageCommandData;
