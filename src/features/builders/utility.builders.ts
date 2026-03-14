import {
	ActionRowBuilder,
	APIEmbed,
	EmbedBuilder,
	EmbedData,
	MessageActionRowComponentBuilder,
} from "discord.js";

/**
 * Utility action row builder
 */
export function createActionRow<T extends MessageActionRowComponentBuilder>(...builders: T[]) {
	return new ActionRowBuilder<T>().setComponents(...builders);
}

/**
 * Utility embed builder
 */
export function createEmbed(data?: EmbedData | APIEmbed) {
	return new EmbedBuilder(data);
}
