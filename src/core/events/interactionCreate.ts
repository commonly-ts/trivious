import {
	ButtonInteraction,
	CacheType,
	GuildMember,
	MessageContextMenuCommandInteraction,
	ModalSubmitInteraction,
	UserContextMenuCommandInteraction,
} from "discord.js";
import {
	ComponentInteraction,
	ComponentType,
	ContextMenuCommand,
	Event,
	PermissionLevel,
	SlashCommand,
} from "src/shared/typings/index.js";
import { hasPermission } from "src/shared/utility/functions.js";
import { handleSlashCommand, verifyGuildPermission } from "../commands/methods.command.js";
import { ChatInputCommandInteraction } from "src/index.js";
import { deconstructCustomId } from "src/shared/utility/components.utility.js";
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

			const requiredPermission = command.permission;
			const hasPermission = await verifyGuildPermission(
				client,
				interaction,
				command,
				requiredPermission || PermissionLevel.USER
			);
			if (!hasPermission) return;

			if (command.context === "SlashCommand" && "data" in command) {
				await handleSlashCommand(
					client,
					command as SlashCommand,
					interaction as ChatInputCommandInteraction
				);
			} else if (command.context === "ContextMenu") {
				await (command as ContextMenuCommand).execute(
					client,
					interaction as
						| UserContextMenuCommandInteraction<CacheType>
						| MessageContextMenuCommandInteraction<CacheType>
				);
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
