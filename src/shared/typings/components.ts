import {
	AnySelectMenuInteraction,
	ButtonInteraction,
	CacheType,
	ModalSubmitInteraction,
} from "discord.js";
import { PermissionLevel } from "./permissions.js";

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

/**
 * Metadata for Components.
 *
 * @export
 * @interface ComponentMetadata
 * @typedef {ComponentMetadata}
 */
export interface ComponentMetadata {
	/**
	 * The customId of the component.
	 *
	 * @type {string}
	 */
	customId: string;
	/**
	 * The permission level required to use the component.
	 *
	 * @type {PermissionLevel}
	 */
	permission: PermissionLevel;
	/**
	 * Whether the interaction reply is ephemeral.
	 *
	 * @type {boolean}
	 */
	ephemeralReply: boolean;
}

/**
 * Deconstruct a component customId into its parts.
 *
 * @param {string} customId
 * @returns {{ componentType: ComponentType; data: string; tags: {}; }}
 */
export const deconstructCustomId = (customId: string) => {
	const [componentType, dataTags] = customId.split(":") as [ComponentType, string];
	const [data, ...tags] = dataTags.split(".") as [string, ...ComponentCustomIdTag[]];

	return {
		componentType,
		data,
		tags,
	};
};

/**
 * Component customId construct options.
 *
 * @export
 * @typedef {CustomIdConstructOptions}
 */
export type CustomIdConstructOptions = {
	type: ComponentType,
	data: string,
	tags?: ComponentCustomIdTag[]
}

/**
 * Construct a component customId.
 *
 * @param {CustomIdConstructOptions} options
 * @returns {string}
 */
export const constructCustomId = (options: CustomIdConstructOptions) => {
	const { data, type, tags } = options;
	return `${type}:${data}${tags ? `.${tags.join(".")}` : ""}`;
}
