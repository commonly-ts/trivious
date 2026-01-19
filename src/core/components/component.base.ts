import { ComponentType } from "discord.js";
import { PermissionLevel } from "src/shared/typings/permissions.js";
import { ComponentInteraction } from "src/shared/typings/components.js";
import TriviousClient from "../client/trivious.client.js";

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
