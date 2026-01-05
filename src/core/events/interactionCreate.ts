import { ButtonInteraction, GuildMember, ModalSubmitInteraction } from "discord.js";
import {
	ComponentInteraction,
	ComponentType,
	deconstructCustomId,
	Event,
	PermissionLevel,
} from "src/shared/typings/index.js";
import { hasPermission } from "src/shared/utility/functions.js";
import Command from "../commands/command.base.js";
import TriviousClient from "../client/trivious.client.js";

async function validateComponentGuildPermission(
	client: TriviousClient,
	interaction: ComponentInteraction,
	permission: PermissionLevel
) {
	if (interaction.guild) {
		const member = interaction.member as GuildMember;
		const memberHasPermission = hasPermission(client, { permission, member });
		return memberHasPermission;
	}

	return false;
}

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

			if (
				(command.isSlashCommand() && command.metadata.doProcessReply) ||
				command.isContextMenuCommand()
			) {
				await command.reply(interaction, { content: "Processing command..." });
			}

			if (interaction.isChatInputCommand() && command.isSlashCommand()) {
				await command.execute(client, interaction);
			} else if (interaction.isContextMenuCommand() && command.isContextMenuCommand()) {
				await command.execute(client, interaction);
			}
		} else if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
			const { compType, tags, data } = deconstructCustomId(interaction.customId);

			if (compType === ComponentType.Button && !(interaction instanceof ButtonInteraction)) return;
			if (compType === ComponentType.Modal && !(interaction instanceof ModalSubmitInteraction))
				return;

			if (tags && tags.includes("awaited")) return;

			const registeredComponents = client.registries.components.get();
			const component = registeredComponents.get(data);
			if (!component) {
				await interaction.reply({
					content: `Command is outdated, inactive or does not have a handler!`,
					flags: ["Ephemeral"],
				});
				return;
			}

			const requiredPermission = component.permission;
			const hasPermission = await validateComponentGuildPermission(
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
