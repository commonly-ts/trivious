import {
	CacheType,
	ChatInputCommandInteraction,
	Collection,
	ContextMenuCommandInteraction,
} from "discord.js";
import { PermissionLevel } from "./permissions.js";
import Subcommand from "src/core/commands/subcommand.base.js";

export type CommandInteraction =
	| ChatInputCommandInteraction<CacheType>
	| ContextMenuCommandInteraction<CacheType>;

export interface CommandMetadata {
	active: boolean;
	guildOnly: boolean;
	ownerOnly: boolean;
	permission: PermissionLevel;
	subcommands: Collection<string, Subcommand>;
	ephemeralReply: boolean;
}

export interface SubcommandMetadata {
	active: boolean;
	ownerOnly: boolean;
	permission: PermissionLevel;
	ephemeralReply: boolean;
}

export interface ContextMenuMetadata {
	active: boolean;
	ownerOnly: boolean;
	permission: PermissionLevel;
	ephemeralReply: boolean;
}
