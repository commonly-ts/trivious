import { ActionRowBuilder, APIEmbed, EmbedBuilder, EmbedData, MessageActionRowComponentBuilder } from "discord.js";

/**
 * Utility action row builder
 *
 * @export
 * @template {MessageActionRowComponentBuilder} T
 * @param {...T[]} builders
 * @returns {*}
 */
export function createActionRow<T extends MessageActionRowComponentBuilder>(...builders: T[]) {
	return new ActionRowBuilder<T>().setComponents(...builders);
}

/**
 * Utility embed builder
 *
 * @export
 * @param {?(EmbedData | APIEmbed)} [data]
 * @returns {*}
 */
export function createEmbed(data?: EmbedData | APIEmbed) {
	return new EmbedBuilder(data);
}
