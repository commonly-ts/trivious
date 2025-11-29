import {
	CacheType,
	ChatInputCommandInteraction,
	InteractionEditReplyOptions,
	InteractionReplyOptions,
	MessagePayload,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import { PermissionLevel, SubcommandMetadata } from "src/shared/typings/index.js";
import TriviousClient from "../client/trivious.client.js";


export class SubcommandBuilder extends SlashCommandSubcommandBuilder {
	private builder = new SlashCommandSubcommandBuilder();
	private _active = true;
	private _ownerOnly = false;
	private _permission = PermissionLevel.USER;
	private _ephemeralReply = false;

	public disable(): this {
		this._active = false;
		return this;
	}

	public setOwnerOnly(): this {
		this._permission = PermissionLevel.BOT_OWNER;
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
			data: this.builder,
			metadata: {
				active: this._active,
				ownerOnly: this._ownerOnly,
				permission: this._permission,
				ephemeralReply: this._ephemeralReply,
			} satisfies SubcommandMetadata,
		};
	}
}

export default abstract class Subcommand {
	abstract data: SlashCommandSubcommandBuilder;
	abstract metadata: SubcommandMetadata;
	abstract readonly execute: (
		client: TriviousClient,
		interaction: ChatInputCommandInteraction<CacheType>
	) => Promise<void>;

	public define() {
		return {
			data: this.data,
			metadata: this.metadata,
		};
	}

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