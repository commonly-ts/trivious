import { Collection } from "discord.js";
import { PermissionLevel } from "./permissions.js";
import Subcommand from "src/core/commands/subcommand.base.js";
import { ChatInputCommandInteraction, ContextMenuCommand, ContextMenuCommandInteraction } from "src/index.js";
import { SlashCommand } from "src/core/commands/command.base.js";

/**
 * Literal type for possible CommandInteractions.
 *
 * @export
 * @typedef {CommandInteraction}
 */
export type CommandInteraction = ChatInputCommandInteraction | ContextMenuCommandInteraction;

/**
 * Metadata for Commands.
 *
 * @export
 * @interface CommandMetadata
 * @typedef {CommandMetadata}
 */
export interface CommandMetadata {
	/**
	 * Whether the command is active, if `false`, the command is skipped during loading and deployment.
	 *
	 * @type {boolean}
	 */
	active: boolean;
	/**
	 * Whether the command is guild-only.
	 *
	 * @type {boolean}
	 */
	guildOnly: boolean;
	/**
	 * Whether the command is owner-only.
	 *
	 * @type {boolean}
	 */
	ownerOnly: boolean;
	/**
	 * The permission level required to use the command.
	 *
	 * @type {PermissionLevel}
	 */
	permission: PermissionLevel;
	/**
	 * Collection of subcommands.
	 *
	 * @type {Collection<string, Subcommand>}
	 */
	subcommands: Collection<string, Subcommand>;
	/**
	 * Whether the interaction is ephemeral.
	 *
	 * @type {boolean}
	 */
	ephemeralReply: boolean;
}

/**
 * Metadata for Subcommands.
 *
 * @export
 * @interface SubcommandMetadata
 * @typedef {SubcommandMetadata}
 */
export interface SubcommandMetadata {
	/**
	 * Whether the subcommand is active, if `false`, the command is skipped during loading.
	 *
	 * @type {boolean}
	 */
	active: boolean;
	/**
	 * Whether the subcommand is owner-only.
	 *
	 * @type {boolean}
	 */
	ownerOnly: boolean;
	/**
	 * The permission level required to use the subcommand.
	 *
	 * @type {PermissionLevel}
	 */
	permission: PermissionLevel;
	/**
	 * Whether the interaction is ephemeral.
	 *
	 * @type {boolean}
	 */
	ephemeralReply: boolean;
}

/**
 * Metadata for ContextMenuCommands.
 *
 * @export
 * @interface ContextMenuMetadata
 * @typedef {ContextMenuMetadata}
 */
export interface ContextMenuMetadata {
	/**
	 * Whether the command is active, if `false`, the command is skipped during loading and deployment.
	 *
	 * @type {boolean}
	 */
	active: boolean;
	/**
	 * Whether the command is owner-only.
	 *
	 * @type {boolean}
	 */
	ownerOnly: boolean;
	/**
	 * The permission level required to use the command.
	 *
	 * @type {PermissionLevel}
	 */
	permission: PermissionLevel;
	/**
	 * Whether the interaction is ephemeral.
	 *
	 * @type {boolean}
	 */
	ephemeralReply: boolean;
}

/**
 * Literal type for generic Command use.
 *
 * @export
 * @typedef {AnyCommand}
 */
export type AnyCommand = SlashCommand | ContextMenuCommand;
