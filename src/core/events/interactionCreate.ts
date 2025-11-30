import { ButtonInteraction, ModalSubmitInteraction } from 'discord.js';
import { ComponentCustomIdTag, ComponentType } from "src/shared/typings/components.js";
import { Event } from "src/shared/typings/events.js";

export default {
	name: "interactionCreate",
	execute: async (client, interaction) => {
		if (interaction.isChatInputCommand()) {
			const { commandName } = interaction;

			const registeredCommands = client.registries.commands.get();
			const command = registeredCommands.get(commandName);
			if (!command) {
				await interaction.reply({ content: `Command is outdated, inactive or does not have a handler!`, flags: ["Ephemeral"] });
				return;
			}

			const requiredPermission = command.metadata.permission;
			const hasPermission = await command.validateGuildPermission(interaction, requiredPermission);
			if (!hasPermission) return;

			await command.reply(interaction, { content: "Processing command..." });
			await command.execute(client, interaction);
		} else if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
			const [componentType, dataTags] = interaction.customId.split(":") as [ComponentType, string];
			const [_, ...tags] = dataTags.split(".") as [string, ...ComponentCustomIdTag[]];

			if (componentType === ComponentType.Button && !(interaction instanceof ButtonInteraction)) return;
			if (componentType === ComponentType.Modal && !(interaction instanceof ModalSubmitInteraction)) return;

			if (tags.includes("awaited")) return;

			const registeredComponents = client.registries.components.get();
			const component = registeredComponents.get(interaction.customId);
			if (!component) {
				await interaction.reply({ content: `Command is outdated, inactive or does not have a handler!`, flags: ["Ephemeral"] });
				return;
			}

			const requiredPermission = component.metadata.permission;
			const hasPermission = await component.validateGuildPermission(interaction, requiredPermission);
			if (!hasPermission) return;

			if (!interaction.isModalSubmit()) await interaction.deferUpdate();
			await component.execute(client, interaction);
		}
	},
} satisfies Event<"interactionCreate">;
