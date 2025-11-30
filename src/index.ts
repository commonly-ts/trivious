import "dotenv/config";
import "node:util";

import type {
	CacheType,
	ChatInputCommandInteraction as DJS_ChatInputCommandInteraction,
	ButtonInteraction as DJS_ButtonInteraction,
	StringSelectMenuInteraction as DJS_StringSelectMenuInteraction,
	ModalSubmitInteraction as DJS_ModalSubmitInteraction,
	ContextMenuCommandInteraction as DJS_ContextMenuCommandInteraction,
} from "discord.js";

// Client
export { default as TriviousClient } from "./core/client/trivious.client.js";

// Commands
export { default as Command } from "./core/commands/command.base.js";
export { default as Subcommand } from "./core/commands/subcommand.base.js";
export { default as CommandRegistry } from "./core/registry/command.registry.js";
export { CommandBuilder, ContextMenuBuilder } from "./core/commands/command.base.js";
export { SubcommandBuilder } from "./core/commands/subcommand.base.js";

// Components
export { default as Component } from "./core/components/component.base.js";
export { default as ComponentRegistry } from "./core/registry/component.registry.js";
export { ComponentBuilder } from "./core/components/component.base.js";

// Typings
export * from "./shared/typings/index.js";

// Cached Interactions
export type ChatInputCommandInteraction = DJS_ChatInputCommandInteraction<CacheType>;
export type ButtonInteraction = DJS_ButtonInteraction<CacheType>;
export type StringSelectMenuInteraction = DJS_StringSelectMenuInteraction<CacheType>;
export type ModalSubmitInteraction = DJS_ModalSubmitInteraction<CacheType>;
export type ContextMenuCommandInteraction = DJS_ContextMenuCommandInteraction<CacheType>;

export { Collection, ClientEvents } from "discord.js";
