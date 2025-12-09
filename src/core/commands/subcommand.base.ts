import {
	CacheType,
	ChatInputCommandInteraction,
	InteractionEditReplyOptions,
	InteractionReplyOptions,
	MessagePayload,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import { PermissionLevel, SubcommandMetadata } from "src/shared/typings/index.js";
import { TriviousClient } from "src/index.js";


/**
 * Base SubcommandBuilder.
 *
 * @export
 * @class SubcommandBuilder
 * @typedef {SubcommandBuilder}
 * @extends {SlashCommandSubcommandBuilder}
 */
export class SubcommandBuilder extends SlashCommandSubcommandBuilder {
	private _active = true;
	private _ownerOnly = false;
	private _permission = PermissionLevel.USER;
	private _ephemeralReply = false;

	/**
	 * Set the subcommand as disabled.
	 *
	 * @public
	 * @returns {this}
	 */
	public disable(): this {
		this._active = false;
		return this;
	}

	/**
	 * Set the subcommand as owner only.
	 *
	 * @public
	 * @returns {this}
	 */
	public setOwnerOnly(): this {
		this._permission = PermissionLevel.BOT_OWNER;
		this._ownerOnly = true;
		return this;
	}

	/**
	 * Set the permission level required to run the subcommand.
	 *
	 * @public
	 * @param {PermissionLevel} permission
	 * @returns {this}
	 */
	public setPermission(permission: PermissionLevel): this {
		this._permission = permission;
		return this;
	}

	/**
	 * Set the interaction as ephemeral
	 *
	 * @public
	 * @returns {this}
	 */
	public setEphemeralReply(): this {
		this._ephemeralReply = true;
		return this;
	}

	/**
	 * Build the builder.
	 *
	 * @public
	 * @returns {{ data: SlashCommandSubcommandBuilder; metadata: SubcommandMetadata; }}
	 */
	public build() {
		return {
			data: this as SlashCommandSubcommandBuilder,
			metadata: {
				active: this._active,
				ownerOnly: this._ownerOnly,
				permission: this._permission,
				ephemeralReply: this._ephemeralReply,
			} satisfies SubcommandMetadata,
		};
	}
}

/**
 * Base Subcommand
 *
 * @export
 * @abstract
 * @class Subcommand
 * @typedef {Subcommand}
 */
export default abstract class Subcommand {
	abstract data: SlashCommandSubcommandBuilder;
	abstract metadata: SubcommandMetadata;
	/**
	 * Function to execute the subcommand.
	 *
	 * @abstract
	 * @readonly
	 * @type {(
	 * 		client: TriviousClient,
	 * 		interaction: ChatInputCommandInteraction<CacheType>
	 * 	) => Promise<void>}
	 */
	abstract readonly execute: (
		client: TriviousClient,
		interaction: ChatInputCommandInteraction<CacheType>
	) => Promise<void>;

	/**
	 * Reply to the interaction respecting command metadata and if the interaction has already been replied to.
	 *
	 * @async
	 * @param {ChatInputCommandInteraction<CacheType>} interaction
	 * @param {(MessagePayload | InteractionEditReplyOptions | InteractionReplyOptions)} options
	 * @returns {*}
	 */
	async reply(
		interaction: ChatInputCommandInteraction<CacheType>,
		options: MessagePayload | InteractionEditReplyOptions | InteractionReplyOptions
	) {
		if (interaction.replied) {
			await interaction.editReply(options as InteractionEditReplyOptions);
			return;
		}

		const newOptions = { ...options } as InteractionReplyOptions;
		if (this.metadata.ephemeralReply) newOptions.flags = ["Ephemeral"];

		await interaction.reply(newOptions);
	}
}
