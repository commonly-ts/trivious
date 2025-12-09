import { ClientOptions } from "discord.js";
import { PermissionLevel } from "./permissions.js";

/**
 * Client options for the TriviousClient
 *
 * @export
 * @interface TriviousClientOptions
 * @typedef {TriviousClientOptions}
 * @extends {ClientOptions}
 */
export interface TriviousClientOptions extends ClientOptions {
	/**
	 * Environment variable for the bot token.
	 *
	 * @type {string}
	 */
	tokenReference: string;
	/**
	 * Environment variable for the client id.
	 *
	 * @type {string}
	 */
	clientIdReference: string;

	// Core paths
	/**
	 * Set core paths for where the registries should look.
	 *
	 * @type {?{
	 * 		commandsPath?: string;
	 * 		componentsPath?: string;
	 * 		eventsPath?: string;
	 * 		modulesPath?: string;
	 * 	}}
	 */
	corePaths?: {
		commandsPath?: string;
		componentsPath?: string;
		eventsPath?: string;
		modulesPath?: string;
	};

	/**
	 * Set base core path, only use if you aren't defining corePaths. This is intended for the case where all your registry folders are in the same directory.
	 *
	 * @type {?string}
	 */
	corePath?: string;

	/**
	 * Roles tied to a PermissionLevel.
	 *
	 * @type {Record<string, PermissionLevel>}
	 */
	rolePermissions?: Record<string, PermissionLevel>;

	/**
	 * Discord user Ids of the bot owner(s)
	 *
	 * @type {string[]}
	 */
	botOwnerIds?: string[];
}
