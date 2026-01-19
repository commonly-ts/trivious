import {
	AnySelectMenuInteraction,
	ButtonInteraction,
	CacheType,
	ModalSubmitInteraction,
} from "discord.js";

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
