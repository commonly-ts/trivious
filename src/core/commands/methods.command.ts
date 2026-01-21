import {
	GuildMember,
	InteractionEditReplyOptions,
	InteractionReplyOptions,
	MessagePayload,
} from "discord.js";
import {
	ChatInputCommandInteraction,
	Command,
	ContextMenuCommandInteraction,
	PermissionLevel,
	SlashCommand,
	SlashSubcommand,
	TriviousClient,
} from "src/index.js";
import { hasPermission } from "src/shared/utility/functions.js";

/**
 * Reply to a command, respecting whether it has been deferred or already replied to.
 *
 * @export
 * @async
 * @param {Command} command
 * @param {ChatInputCommandInteraction | ContextMenuCommandInteraction} interaction
 * @param {(MessagePayload | InteractionEditReplyOptions | InteractionReplyOptions)} options
 * @returns {*}
 */
export async function commandReply(
	command: Command,
	interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction,
	options: MessagePayload | InteractionEditReplyOptions | InteractionReplyOptions
) {
	if (interaction.replied || interaction.deferred) {
		await interaction.editReply(options as InteractionEditReplyOptions);
		return;
	}

	const newOptions = { ...options } as InteractionReplyOptions;
	if (command.flags && command.flags.includes("EphemeralReply")) newOptions.flags = ["Ephemeral"];

	await interaction.reply(newOptions);
}

/**
 * Compare a permission level to the guild member's permission level.
 *
 * @export
 * @async
 * @param {TriviousClient} client
 * @param {ChatInputCommandInteraction | ContextMenuCommandInteraction} interaction
 * @param {Command} command
 * @param {PermissionLevel} requiredPermission
 * @param {boolean} [doReply=true]
 * @returns {unknown}
 */
export async function verifyGuildPermission(
	client: TriviousClient,
	interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction,
	command: Command,
	requiredPermission: PermissionLevel,
	doReply: boolean = true
) {
	if (!interaction.inGuild()) return true;

	const member = interaction.member as GuildMember;
	const memberHasPermission = hasPermission(client, { permission: requiredPermission, member });

	if (!memberHasPermission && doReply) {
		await commandReply(command, interaction, {
			content: `You do not have permission to run this command, required permission: \`${PermissionLevel[requiredPermission]}\``,
		});
	}

	return memberHasPermission;
}

/**
 * Handle execution of a slash command.
 *
 * @export
 * @async
 * @param {TriviousClient} client
 * @param {(SlashCommand | SlashSubcommand)} command
 * @param {ChatInputCommandInteraction} interaction
 * @returns {*}
 */
export async function handleSlashCommand(
	client: TriviousClient,
	command: SlashCommand,
	interaction: ChatInputCommandInteraction
) {
	const { options } = interaction;

	const hasPerm = await verifyGuildPermission(
		client,
		interaction,
		command,
		command.permission || PermissionLevel.USER,
		true
	);

	if ("run" in command && command.run && hasPerm) {
		await command.run(client, interaction);
	}

	if (!hasPerm) return;

	// skip subcommand processing and respect command flags
	if (!options.getSubcommand(false) || !("subcommands" in command)) {
		if (command.flags?.includes("DeferReply")) {
			await commandReply(command, interaction, { content: "Processing command..." });
		}

		return;
	}

	const subcommandName = options.getSubcommand();
	const subcommand = command.subcommands!.get(subcommandName) as SlashSubcommand | undefined;

	if (!subcommand) {
		await commandReply(command, interaction, {
			content: "This subcommand no longer exists or is not registered.",
		});
		return;
	}

	// respect subcommand flags over command flags
	if (subcommand.flags?.includes("DeferReply") && !subcommand.flags.includes("ModalResponse")) {
		await commandReply(command, interaction, { content: "Processing command..." });
	}

	await subcommand.execute(client, interaction);
}
