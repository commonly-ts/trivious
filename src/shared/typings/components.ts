import {
	AnySelectMenuInteraction,
	ButtonInteraction,
	CacheType,
	ModalSubmitInteraction,
} from "discord.js";
import { PermissionLevel } from "./permissions.js";
import TriviousClient from "src/core/client/trivious.client.js";

/**
 * Base component interface.
 *
 * @export
 * @interface Component
 * @typedef {Component}
 */
export interface Component {
	component: ComponentType;
	permission: PermissionLevel;
	/**
	 * The full constructed customId.
	 *
	 * @type {?string}
	 */
	customId?: string;
	/**
	 * The 'data' part of a constructed customId.
	 *
	 * @type {?string}
	 */
	customIdData?: string;
	ephemeralReply?: boolean;
	execute: (client: TriviousClient, interaction: ComponentInteraction) => Promise<void> | void;
}

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
