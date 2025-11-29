import {
	ComponentType,
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
import TriviousClient from "../client/trivious.client.js";

export default abstract class Component {
	abstract metadata: ComponentMetadata;
	abstract execute: (client: TriviousClient, interaction: ComponentInteraction) => Promise<void>;

	protected async reply(
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

export class ComponentBuilder {
	private _customId = "";
	private _permission = PermissionLevel.USER;
	private _ephemeralReply = false;

	public setCustomId(options: {
		type: ComponentType;
		data: string;
		tags?: ComponentCustomIdTag[];
	}): this {
		const { data, type, tags } = options;
		this._customId = `${type}:${data}${tags ? `.${tags.join(".")}` : ""}`;
		return this;
	}

	public setPermission(permission: PermissionLevel): this {
		this._permission = permission;
		return this;
	}

	public setEphemeralReply(): this {
		this._ephemeralReply = true;
		return this;
	}

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
