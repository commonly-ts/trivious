import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { UserCommandData } from "src/features/commands/commands.types.js";

export default {
	active: true,
	commandType: ApplicationCommandType.User,
	data: new ContextMenuCommandBuilder().setName("user-context"),

	async execute() {},
} satisfies UserCommandData;
