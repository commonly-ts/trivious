import {
	ComponentType,
	GuildMember,
	InteractionEditReplyOptions,
	InteractionReplyOptions,
	MessagePayload,
} from "discord.js";
import {
	ComponentCustomIdTag,
	ComponentInteraction,
	ComponentMetadata,
	PermissionLevel,
} from "src/shared/typings/index.js";
import { hasPermission } from "src/shared/utility/functions.js";
import TriviousClient from "../client/trivious.client.js";

/**
 * Base ComponentBuilder.
 *
 * @export
 * @class ComponentBuilder
 * @typedef {ComponentBuilder}
 */
export class ComponentBuilder {
	private _customId = "";
	private _permission = PermissionLevel.USER;
	private _ephemeralReply = false;

	/**
	 * Set the customId for the component.
	 *
	 * @public
	 * @param {{
	 * 		type: ComponentType;
	 * 		data: string;
	 * 		tags?: ComponentCustomIdTag[];
	 * 	}} options
	 * @returns {this}
	 */
	public setCustomId(options: {
		type: ComponentType;
		data: string;
		tags?: ComponentCustomIdTag[];
	}): this {
		const { data, type, tags } = options;
		this._customId = `${type}:${data}${tags ? `.${tags.join(".")}` : ""}`;
		return this;
	}

	/**
	 * Set the permission required to use the component.
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
	 * Set the interaction as ephemeral.
	 *
	 * @public
	 * @returns {this}
	 */
	public setEphemeralReply(): this {
		this._ephemeralReply = true;
		return this;
	}

	/**
	 * Builder the builder.
	 *
	 * @public
	 * @returns {{ metadata: ComponentMetadata; }}
	 */
	public build() {
		return {
			metadata: {
				customId: this._customId,
				permission: this._permission,
				ephemeralReply: this._ephemeralReply,
			} satisfies ComponentMetadata,
		};
	}
}

/**
 * Base Component.
 *
 * @export
 * @abstract
 * @class Component
 * @typedef {Component}
 */
export default abstract class Component {
	abstract metadata: ComponentMetadata;
	/**
	 * Execute the component.
	 *
	 * @abstract
	 * @type {(client: TriviousClient, interaction: ComponentInteraction) => Promise<void>}
	 */
	abstract execute: (client: TriviousClient, interaction: ComponentInteraction) => Promise<void>;

	/**
	 * Validate permissions for a user/member in a guild.
	 *
	 * @async
	 * @param {ComponentInteraction} interaction
	 * @param {PermissionLevel} permission
	 * @param {boolean} [doReply=true] Defaults to `true`
	 * @returns {unknown}
	 */
	async validateGuildPermission(
		client: TriviousClient,
		interaction: ComponentInteraction,
		permission: PermissionLevel,
		doReply: boolean = true
	) {
		if (interaction.guild) {
			const member = interaction.member as GuildMember;
			const memberHasPermission = hasPermission(client, { permission, member });

			if (!memberHasPermission) {
				if (doReply)
					await this.reply(interaction, {
						content: `You do not have permission to run this command, required permission: \`${PermissionLevel[permission]}\``,
					});
				return false;
			}
		}

		return true;
	}

	/**
	 * Reply to the interaction respecting command metadata and if the interaction has already been replied to.
	 *
	 * @async
	 * @param {ComponentInteraction} interaction
	 * @param {(MessagePayload | InteractionEditReplyOptions | InteractionReplyOptions)} options
	 * @returns {*}
	 */
	async reply(
		interaction: ComponentInteraction,
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
