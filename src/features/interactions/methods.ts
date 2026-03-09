import { CacheType, Interaction, InteractionEditReplyOptions, InteractionReplyOptions, MessagePayload } from "discord.js";
import { CommandFlags } from "../commands/commands.types.js";

export function interactionReply(
	interaction: Interaction<CacheType> & { deferred: true },
	options: InteractionEditReplyOptions | MessagePayload,
	flags?: CommandFlags[]
): Promise<unknown>;

export function interactionReply(
	interaction: Interaction<CacheType> & { replied: true },
	options: InteractionEditReplyOptions | MessagePayload,
	flags?: CommandFlags[]
): Promise<unknown>;

export function interactionReply(
	interaction: Interaction<CacheType> & { deferred: false; replied: false },
	options: InteractionReplyOptions | MessagePayload,
	flags?: CommandFlags[]
): Promise<unknown>;

export async function interactionReply(
	interaction: Interaction<CacheType>,
	options: InteractionReplyOptions | InteractionEditReplyOptions | MessagePayload,
	_flags?: CommandFlags[]
) {
	if (!("reply" in interaction)) return;
	if (interaction.deferred || interaction.replied) {
		return await interaction.editReply(options as InteractionEditReplyOptions);
	}

	return await interaction.reply(options as InteractionReplyOptions);
}
