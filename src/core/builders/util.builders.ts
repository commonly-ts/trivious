import { ActionRowBuilder, APIEmbed, EmbedBuilder, EmbedData, MessageActionRowComponentBuilder } from "discord.js";

export function createActionRow<T extends MessageActionRowComponentBuilder>(...builders: T[]) {
	return new ActionRowBuilder<T>().setComponents(...builders);
}

export function createEmbed(data?: EmbedData | APIEmbed) {
	return new EmbedBuilder(data);
}
