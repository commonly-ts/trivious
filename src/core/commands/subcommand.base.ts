import {
	CacheType,
	ChatInputCommandInteraction,
	InteractionEditReplyOptions,
	InteractionReplyOptions,
	MessagePayload,
	SlashCommandAttachmentOption,
	SlashCommandBooleanOption,
	SlashCommandChannelOption,
	SlashCommandIntegerOption,
	SlashCommandMentionableOption,
	SlashCommandNumberOption,
	SlashCommandRoleOption,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
	SlashCommandUserOption,
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
	disable(): this {
		this._active = false;
		return this;
	}

	/**
	 * Set the subcommand as owner only.
	 *
	 * @public
	 * @returns {this}
	 */
	setOwnerOnly(): this {
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
	setPermission(permission: PermissionLevel): this {
		this._permission = permission;
		return this;
	}

	/**
	 * Set the interaction as ephemeral
	 *
	 * @public
	 * @returns {this}
	 */
	setEphemeralReply(): this {
		this._ephemeralReply = true;
		return this;
	}

	/**
	 * Build the builder.
	 *
	 * @public
	 * @returns {{ data: SubcommandBuilder; metadata: SubcommandMetadata; }}
	 */
	build() {
		return {
			data: this as SubcommandBuilder,
			metadata: {
				active: this._active,
				ownerOnly: this._ownerOnly,
				permission: this._permission,
				ephemeralReply: this._ephemeralReply,
			} satisfies SubcommandMetadata,
		};
	}

	addAttachmentOption(
		input:
			| SlashCommandAttachmentOption
			| ((builder: SlashCommandAttachmentOption) => SlashCommandAttachmentOption)
	): this {
		super.addAttachmentOption(input);
		return this;
	}

	addBooleanOption(
		input:
			| SlashCommandBooleanOption
			| ((builder: SlashCommandBooleanOption) => SlashCommandBooleanOption)
	): this {
		super.addBooleanOption(input);
		return this;
	}

	addChannelOption(
		input:
			| SlashCommandChannelOption
			| ((builder: SlashCommandChannelOption) => SlashCommandChannelOption)
	): this {
		super.addChannelOption(input);
		return this;
	}

	addIntegerOption(
		input:
			| SlashCommandIntegerOption
			| ((builder: SlashCommandIntegerOption) => SlashCommandIntegerOption)
	): this {
		super.addIntegerOption(input);
		return this;
	}

	addMentionableOption(
		input:
			| SlashCommandMentionableOption
			| ((builder: SlashCommandMentionableOption) => SlashCommandMentionableOption)
	): this {
		super.addMentionableOption(input);
		return this;
	}

	addNumberOption(
		input:
			| SlashCommandNumberOption
			| ((builder: SlashCommandNumberOption) => SlashCommandNumberOption)
	): this {
		super.addNumberOption(input);
		return this;
	}

	addRoleOption(
		input: SlashCommandRoleOption | ((builder: SlashCommandRoleOption) => SlashCommandRoleOption)
	): this {
		super.addRoleOption(input);
		return this;
	}

	addStringOption(
		input:
			| SlashCommandStringOption
			| ((builder: SlashCommandStringOption) => SlashCommandStringOption)
	): this {
		super.addStringOption(input);
		return this;
	}

	addUserOption(
		input: SlashCommandUserOption | ((builder: SlashCommandUserOption) => SlashCommandUserOption)
	): this {
		super.addUserOption(input);
		return this;
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
	readonly data: SubcommandBuilder;
	readonly metadata: SubcommandMetadata;

	protected constructor(builder: SubcommandBuilder) {
		const { data, metadata } = builder.build();
		this.data = data;
		this.metadata = metadata;
	}

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
		if (interaction.replied || interaction.deferred) {
			await interaction.editReply(options as InteractionEditReplyOptions);
			return;
		}

		const newOptions = { ...options } as InteractionReplyOptions;
		if (this.metadata.ephemeralReply) newOptions.flags = ["Ephemeral"];

		await interaction.reply(newOptions);
	}
}
