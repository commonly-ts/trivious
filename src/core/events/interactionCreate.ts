import { ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import { ComponentType, deconstructCustomId, Event } from "src/shared/typings/index.js";
import Command from "../commands/command.base.js";

export default {
	name: "interactionCreate",
	execute: async (client, interaction) => {
		if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
			const { commandName } = interaction;

			const registeredCommands = client.registries.commands.get();
			const command = registeredCommands.get(commandName);
			if (!command) {
				await interaction.reply({
					content: `Command is outdated, inactive or does not have a handler!`,
					flags: ["Ephemeral"],
				});
				return;
			}

			const requiredPermission = command.metadata.permission;
			const hasPermission = await command.validateGuildPermission(
				client,
				interaction,
				requiredPermission
			);
			if (!hasPermission) return;

			if (!("execute" in command)) {
				await (command as Command).reply(interaction, {
					content:
						"Command does not have a way to execute! Ensure the command is a SlashCommand or ContextMenuCommand!",
				});
				return;
			}

			await command.reply(interaction, { content: "Processing command..." });

			if (interaction.isChatInputCommand() && command.isSlashCommand()) {
				await command.execute(client, interaction);
			} else if (interaction.isContextMenuCommand() && command.isContextMenuCommand()) {
				await command.execute(client, interaction);
			}
		} else if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
			const { componentType, tags, data } = deconstructCustomId(interaction.customId);

			if (componentType === ComponentType.Button && !(interaction instanceof ButtonInteraction))
				return;
			if (componentType === ComponentType.Modal && !(interaction instanceof ModalSubmitInteraction))
				return;

			if (tags.includes("awaited")) return;

			const registeredComponents = client.registries.components.get();
			const component = registeredComponents.get(data);
			if (!component) {
				await interaction.reply({
					content: `Command is outdated, inactive or does not have a handler!`,
					flags: ["Ephemeral"],
				});
				return;
			}

			const requiredPermission = component.metadata.permission;
			const hasPermission = await component.validateGuildPermission(
				client,
				interaction,
				requiredPermission
			);
			if (!hasPermission) return;

			if (!interaction.isModalSubmit()) await interaction.deferUpdate();
			await component.execute(client, interaction);
		}
	},
} satisfies Event<"interactionCreate">;
