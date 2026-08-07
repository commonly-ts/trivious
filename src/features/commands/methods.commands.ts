import { CommandFlags } from "#typings";
import {
	CacheType,
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
