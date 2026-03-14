import type { CommandFlags, SlashCommandData, TriviousClient } from "#typings";
import type {
	CacheType,
	ChatInputCommandInteraction,
	Interaction,
	InteractionEditReplyOptions,
	InteractionReplyOptions,
	MessagePayload,
} from "discord.js";

export async function interactionReply(options: {
	interaction: Interaction<CacheType>;
	replyPayload: InteractionReplyOptions | InteractionEditReplyOptions | MessagePayload;
	flags?: (CommandFlags | "FollowUp")[];
}) {
	const { interaction, replyPayload, flags } = options;
	if (!("reply" in interaction)) return;

	const payload = replyPayload as InteractionReplyOptions;
	if (flags?.includes("EphemeralReply")) payload.flags = ["Ephemeral"];

	if (interaction.deferred || interaction.replied) {
		if (flags?.includes("FollowUp")) return await interaction.followUp(payload);
		return await interaction.editReply(payload as InteractionEditReplyOptions);
	}

	return await interaction.reply(payload);
}

export async function handleSlashCommand(
	client: TriviousClient,
	command: SlashCommandData,
	interaction: ChatInputCommandInteraction
) {
	const { options } = interaction;

	if (command.flags?.includes("Cached") && !interaction.inCachedGuild()) return;
	if (command.flags?.includes("ExpectModal")) return;
	if (command.flags?.includes("DeferReply")) {
		await interactionReply({
			interaction,
			flags: command.flags,
			replyPayload: { content: "Processing command..." },
		});
	}

	if ("run" in command && command.run) {
		try {
			await command.run(client, interaction);
		} catch {}
	}

	const subcommandGroup = options.getSubcommandGroup(false);
	const subcommand = options.getSubcommand(false);

	if (subcommandGroup && command.subcommandGroups && subcommand) {
		const foundGroup = command.subcommandGroups.get(subcommandGroup);
		if (!foundGroup) {
			await interactionReply({
				interaction,
				flags: ["EphemeralReply"],
				replyPayload: {
					content: "Subcommand group is outdated, inactive, or does not have a handler!",
				},
			});
			return;
		}

		const foundSubcommand = foundGroup.subcommands.get(subcommand);
		if (!foundSubcommand) {
			await interactionReply({
				interaction,
				flags: ["EphemeralReply"],
				replyPayload: { content: "Subcommand is outdated, inactive, or does not have a handler!" },
			});
			return;
		}

		return await foundSubcommand.execute(client, interaction);
	} else if (subcommand && command.subcommands) {
		const foundSubcommand = command.subcommands.get(subcommand);
		if (!foundSubcommand) {
			await interactionReply({
				interaction,
				flags: ["EphemeralReply"],
				replyPayload: { content: "Subcommand is outdated, inactive, or does not have a handler!" },
			});
			return;
		}

		return await foundSubcommand.execute(client, interaction);
	}
}
