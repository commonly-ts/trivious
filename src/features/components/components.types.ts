import { CommandPermissionValues, TriviousClient } from "#typings";
import { AnySelectMenuInteraction, ButtonInteraction, ModalSubmitInteraction } from "discord.js";

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

type ContextualComponentInteraction<Context extends ComponentContext = ComponentContext> =
	Context extends ComponentContext.Button
		? ButtonInteraction
		: Context extends ComponentContext.SelectMenu
			? AnySelectMenuInteraction
			: Context extends ComponentContext.Modal
				? ModalSubmitInteraction
				: ComponentInteraction;

/**
 * Trivious component
 * @param context The component context
 * @param identifier The unique identifier inside the custom id
 * @param flags The component flags
 * @param execute Component handler
 */
export interface Component<Context extends ComponentContext = ComponentContext> {
	/**
	 * @deprecated Use context instead
	 */
	component?: Context;
	context: Context;
	identifier: string;
	flags?: ComponentFlags[];
	permissions?: CommandPermissionValues;
	execute: (
		client: TriviousClient,
		interaction: ContextualComponentInteraction<Context>
	) => Promise<void>;
}
