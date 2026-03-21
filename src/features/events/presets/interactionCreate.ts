import {
	BaseContextCommandData,
	ComponentContext,
	SlashCommandData,
	TriviousClient,
	type ContextCommandData,
	type Event,
} from "#typings";
import {
	ApplicationCommandType,
	ButtonInteraction,
	ChatInputCommandInteraction,
	GuildMember,
	MessageContextMenuCommandInteraction,
	ModalSubmitInteraction,
	UserContextMenuCommandInteraction,
} from "discord.js";
import { handleSlashCommand, interactionReply } from "src/features/commands/methods.commands.js";
import customId from "src/features/customId/methods.customid.js";
import { canMemberRunCommand } from "src/features/permissions/methods.permissions.js";

/**
 * Check if the command is a subcommand and validate whether the member can run the command based on subcommand permissions
 */
function validateMemberPermissionsForSubcommand(
	client: TriviousClient,
	command: SlashCommandData | BaseContextCommandData,
	interaction:
		| ChatInputCommandInteraction
		| MessageContextMenuCommandInteraction
		| UserContextMenuCommandInteraction
): boolean {
	if (!("subcommands" in command)) return false;
	if (!interaction.isChatInputCommand()) return false;

	const { options } = interaction;

	const subcommandName = options.getSubcommand(false);
	const groupName = options.getSubcommandGroup(false);
	if (!subcommandName) return false;

	if (groupName) {
		const group = command.subcommandGroups?.get(groupName);
		if (!group) return false;

		const subcommand = group.subcommands.get(subcommandName);
		if (!subcommand) return false;

		return canMemberRunCommand(client, subcommand, interaction.member as GuildMember)[0];
	}

	const subcommand = command.subcommands?.get(subcommandName);
	if (!subcommand) return false;

	return canMemberRunCommand(client, subcommand, interaction.member as GuildMember)[0];
}

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

			const hasPermission =
				validateMemberPermissionsForSubcommand(client, command, interaction) ||
				canMemberRunCommand(client, command, interaction.member as GuildMember);
			if (!hasPermission) {
				await interactionReply({
					interaction,
					replyPayload: { content: "You do not have permission to run this command" },
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

			const hasPermission = canMemberRunCommand(
				client,
				component,
				interaction.member as GuildMember
			);
			if (!hasPermission) {
				await interactionReply({
					interaction,
					replyPayload: { content: "You do not have permission to use this component" },
					flags: ["EphemeralReply"],
				});
				return;
			}

			await component.execute(client, interaction);
		}
	},
} satisfies Event<"interactionCreate">;
