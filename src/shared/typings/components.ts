import {
	AnySelectMenuInteraction,
	ButtonInteraction,
	CacheType,
	ModalSubmitInteraction,
} from "discord.js";
import { PermissionLevel } from "./permissions.js";
import TriviousClient from "src/core/client/trivious.client.js";

/**
 * Tags for component customIds.
 *
 * @export
 * @typedef {ComponentCustomIdTag}
 */
export type ComponentCustomIdTag = "awaited";
/**
 * Interaction types for components.
 *
 * @export
 * @typedef {ComponentInteraction}
 */
export type ComponentInteraction =
	| AnySelectMenuInteraction<CacheType>
	| ButtonInteraction<CacheType>
	| ModalSubmitInteraction<CacheType>;
/**
 * What type of component is the componenty.
 *
 * @export
 * @enum {number}
 */
export enum ComponentType {
	Button = "button",
	SelectMenu = "select",
	Modal = "modal",
}

export interface Component {
	component: ComponentType;
	customId?: string;
	customIdData?: string;
	permission: PermissionLevel;
	ephemeralReply?: boolean;
	execute: (client: TriviousClient, interaction: ComponentInteraction) => Promise<void> | void;
}

/**
 * Deconstruct a component customId into its parts.
 *
 * @param {string} customId
 * @returns {CustomIdConstructOptions}
 */
export const deconstructCustomId = (customId: string) => {
	const [componentType, dataTags] = customId.split(":") as [ComponentType, string];
	const [data, ...tags] = dataTags.split(".") as [string, ...ComponentCustomIdTag[]];

	return {
		compType: componentType,
		data,
		tags,
	} as CustomIdConstructOptions;
};

/**
 * Component customId construct options.
 *
 * @export
 * @typedef {CustomIdConstructOptions}
 */
export type CustomIdConstructOptions = {
	compType: ComponentType;
	data: string;
	tags?: ComponentCustomIdTag[];
};

/**
 * Construct a component customId.
 *
 * @param {CustomIdConstructOptions} options
 * @returns {string}
 */
export const constructCustomId = (options: CustomIdConstructOptions) => {
	const { data, compType, tags } = options;
	return `${compType}:${data}${tags ? `.${tags.join(".")}` : ""}`;
};
