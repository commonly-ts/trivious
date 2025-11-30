import { Collection } from "discord.js";
import { PermissionLevel } from "./permissions.js";
import Subcommand from "src/core/commands/subcommand.base.js";
import { ChatInputCommandInteraction, ContextMenuCommandInteraction } from "src/index.js";
import { ContextMenuCommand, SlashCommand } from "src/core/commands/command.base.js";

export type CommandInteraction = ChatInputCommandInteraction | ContextMenuCommandInteraction;

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

export type AnyCommand = SlashCommand | ContextMenuCommand;
