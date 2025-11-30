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

export default abstract class Component {
	abstract metadata: ComponentMetadata;
	abstract execute: (client: TriviousClient, interaction: ComponentInteraction) => Promise<void>;

	async validateGuildPermission(
		interaction: ComponentInteraction,
		permission: PermissionLevel,
		doReply: boolean = true
	) {
		if (interaction.guild) {
			const member = interaction.member as GuildMember;
			const memberHasPermission = hasPermission({ permission, member });

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
