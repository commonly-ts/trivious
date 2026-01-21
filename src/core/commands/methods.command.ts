import {
	CacheType,
	ChatInputCommandInteraction,
	GuildMember,
	Interaction,
	InteractionEditReplyOptions,
	InteractionReplyOptions,
	MessagePayload,
} from "discord.js";
import {
	Command,
	CommandFlags,
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
export async function interactionReply(data: {
	flags?: ("FollowUp" | CommandFlags)[];
	interaction: Interaction<CacheType>;
	options: MessagePayload | InteractionEditReplyOptions | InteractionReplyOptions;
}) {
	const { interaction, flags, options } = data;
	if (!("reply" in interaction)) {
		throw new Error(`Cannot reply to interaction type ${typeof interaction}`);
	}

	const ephemeral = flags?.includes("EphemeralReply");
	const followUp = flags?.includes("FollowUp");

	const newOptions = options as InteractionReplyOptions;
	if (ephemeral) newOptions.flags = ["Ephemeral"];

	if (interaction.replied || interaction.deferred) {
		if (followUp) await interaction.followUp(newOptions);
		else await interaction.editReply(options as InteractionEditReplyOptions);
	} else {
		await interaction.reply(newOptions);
	}
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
	interaction: Interaction<CacheType>,
	command: Command,
	requiredPermission: PermissionLevel,
	doReply: boolean = true
) {
	if (!interaction.inGuild()) return true;

	if (command.flags && command.flags.includes("OwnerOnly")) {
		requiredPermission = PermissionLevel.BOT_OWNER;
	}

	const member = interaction.member as GuildMember;
	const memberHasPermission = hasPermission(client, { permission: requiredPermission, member });

	if (!memberHasPermission && doReply) {
		await interactionReply({
			flags: command.flags,
			interaction,
			options: {
				content: `You do not have permission to run this command, required permission: \`${PermissionLevel[requiredPermission]}\``,
			},
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
			await interactionReply({
				flags: command.flags,
				interaction,
				options: { content: "Processing command..." },
			});
		}

		return;
	}

	const subcommandName = options.getSubcommand();
	const subcommand = command.subcommands!.get(subcommandName) as SlashSubcommand | undefined;

	if (!subcommand) {
		await interactionReply({
			flags: command.flags,
			interaction,
			options: {
				content: "This subcommand no longer exists or is not registered.",
			},
		});
		return;
	}

	// respect subcommand flags over command flags
	if (subcommand.flags?.includes("DeferReply") && !subcommand.flags.includes("ModalResponse")) {
		await interactionReply({
			flags: command.flags,
			interaction,
			options: { content: "Processing command..." },
		});
	}

	await subcommand.execute(client, interaction);
}
