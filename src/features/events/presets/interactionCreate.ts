import { ComponentContext, type ContextCommandData, type Event } from "#typings";
import { ApplicationCommandType, ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import { handleSlashCommand, interactionReply } from "src/features/commands/methods.commands.js";
import customId from "src/features/customId/methods.customid.js";

export default {
	name: "interactionCreate",
	async execute(client, interaction) {
		if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
			const { commandName } = interaction;

			const storeToCheck = interaction.isChatInputCommand()
				? client.stores.commands.chatInput
				: client.stores.commands.context;
			const command = storeToCheck.get(commandName);

			if (!command) {
				await interactionReply({
					interaction,
					replyPayload: { content: "Command is outdated, inactive, or does not have a handler!" },
					flags: ["EphemeralReply"],
				});
				return;
			}

			if (
				command.commandType === ApplicationCommandType.ChatInput &&
				interaction.isChatInputCommand()
			) {
				await handleSlashCommand(client, command, interaction);
			} else {
				await (command as ContextCommandData).execute(client, interaction as never);
			}
		} else if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
			const { context, identifier, tags } = customId.decode(interaction.customId);

			if (context === ComponentContext.Button && !(interaction instanceof ButtonInteraction))
				return;
			if (context === ComponentContext.Modal && !(interaction instanceof ModalSubmitInteraction))
				return;
			if (tags && tags.includes("awaited")) return;

			const component = client.stores.components.get(identifier);

			if (!component) {
				await interactionReply({
					interaction,
					replyPayload: { content: "Command is outdated, inactive, or does not have a handler!" },
					flags: ["EphemeralReply"],
				});
				return;
			}

			await component.execute(client, interaction);
		}
	},
} satisfies Event<"interactionCreate">;
