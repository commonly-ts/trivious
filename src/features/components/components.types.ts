import type { TriviousClient } from "#typings";
import type {
	AnySelectMenuInteraction,
	ButtonInteraction,
	ModalSubmitInteraction,
} from "discord.js";

export type ComponentFlags = "Cached" | "DeferReply" | "EphemeralReply" | "ExpectModal";
export type ComponentInteraction =
	| AnySelectMenuInteraction
	| ButtonInteraction
	| ModalSubmitInteraction;

export enum ComponentContext {
	Button,
	SelectMenu,
	Modal,
}

/**
 * Trivious component
 * @param component The component type
 * @param identifier The unique identifier inside the custom id
 * @param flags The component flags
 * @param execute Component handler
 */
export interface Component {
	component: ComponentContext;
	identifier: string;
	flags?: ComponentFlags[];
	execute: (client: TriviousClient, interaction: ComponentInteraction) => Promise<void>;
}
