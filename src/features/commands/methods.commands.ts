import { CommandFlags, SlashCommandData, TriviousClient } from "#typings";
import {
	CacheType,
	ChatInputCommandInteraction,
	Interaction,
	InteractionEditReplyOptions,
	InteractionReplyOptions,
	InteractionResponse,
	Message,
	MessagePayload,
} from "discord.js";

export async function interactionReply(options: {
	interaction: Interaction<CacheType>;
	replyPayload: InteractionReplyOptions;
	flags?: (CommandFlags | "FollowUp")[];
}): Promise<InteractionResponse<boolean>>;

export async function interactionReply(options: {
	interaction: Interaction<CacheType>;
	replyPayload: InteractionEditReplyOptions;
	flags?: (CommandFlags | "FollowUp")[];
}): Promise<Message<boolean>>;

export async function interactionReply(options: {
	interaction: Interaction<CacheType>;
	replyPayload: MessagePayload;
	flags?: (CommandFlags | "FollowUp")[];
}): Promise<InteractionResponse<boolean> | Message<boolean>>;

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

async function handleFlags(interaction: ChatInputCommandInteraction, flags?: CommandFlags[]) {
	if (flags?.includes("Cached") && !interaction.inCachedGuild()) return;
	if (flags?.includes("ExpectModal")) return;
	if (flags?.includes("DeferReply")) {
		await interactionReply({
			interaction,
			flags: flags,
			replyPayload: { content: "Processing command..." },
		});
	}
}

export async function handleSlashCommand(
	client: TriviousClient,
	command: SlashCommandData,
	interaction: ChatInputCommandInteraction
) {
	const { options } = interaction;

	const subcommandGroup = options.getSubcommandGroup(false);
	const subcommand = options.getSubcommand(false);

	if (!subcommandGroup || !subcommand) {
		await handleFlags(interaction, command.flags);

		if ("run" in command && command.run) {
			try {
				await command.run(client, interaction);
			} catch (err: any) {
				console.error(err);
			}
		}

		return;
	}

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

		await handleFlags(interaction, foundSubcommand.flags);
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

		await handleFlags(interaction, foundSubcommand.flags);
		return await foundSubcommand.execute(client, interaction);
	} else {
		await interactionReply({
			interaction,
			flags: ["EphemeralReply"],
			replyPayload: { content: "Command is outdated, inactive, or does not have a handler!" },
		});
	}
}
