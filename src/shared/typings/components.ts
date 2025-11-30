import {
	AnySelectMenuInteraction,
	ButtonInteraction,
	CacheType,
	ModalSubmitInteraction,
} from "discord.js";
import { PermissionLevel } from "./permissions.js";

export type ComponentCustomIdTag = "awaited";
export type ComponentInteraction =
	| AnySelectMenuInteraction<CacheType>
	| ButtonInteraction<CacheType>
	| ModalSubmitInteraction<CacheType>;
export enum ComponentType {
	Button = "button",
	SelectMenu = "select",
	Modal = "modal",
}

export interface ComponentMetadata {
	customId: string;
	permission: PermissionLevel;
	ephemeralReply: boolean;
}

export const deconstructCustomId = (customId: string) => {
	const [componentType, dataTags] = customId.split(":") as [ComponentType, string];
	const [data, ...tags] = dataTags.split(".") as [string, ...ComponentCustomIdTag[]];

	return {
		componentType,
		data,
		tags,
	};
};
