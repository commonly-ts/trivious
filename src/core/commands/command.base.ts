import {
	Collection,
	ContextMenuCommandBuilder,
	GuildMember,
	InteractionContextType,
	InteractionEditReplyOptions,
	InteractionReplyOptions,
	MessagePayload,
	SlashCommandBuilder,
	User,
} from "discord.js";
import {
	CommandInteraction,
	CommandMetadata,
	ContextMenuMetadata,
	getPermissionLevel,
	PermissionLevel,
} from "src/shared/typings/index.js";
import TriviousClient from "../client/trivious.client.js";
import Subcommand from "./subcommand.base.js";

function hasPermission(options: {
	permission: PermissionLevel;
	user?: User;
	member?: GuildMember;
}) {
	const { permission, user, member } = options;

	if (user) {
		if (permission === PermissionLevel.BOT_OWNER) {
			return !(user.id === "424764032667484171");
		}
		return true;
	}

	if (member) {
		const memberPermission = getPermissionLevel(member);
		return permission > memberPermission;
	}

	return false;
}


export class CommandBuilder extends SlashCommandBuilder {
	private _active = true;
	private _guildOnly = false;
	private _ownerOnly = false;
	private _permission = PermissionLevel.USER;
	private _subcommands = new Collection<string, Subcommand>();
	private _ephemeralReply = false;

	public disable(): this {
		this._active = false;
		return this;
	}

	public setGuildOnly(): this {
		this._guildOnly = true;
		this._permission = PermissionLevel.USER;
		this.setContexts(InteractionContextType.Guild);
		return this;
	}

	public setOwnerOnly(): this {
		this._permission = PermissionLevel.BOT_OWNER;
		return this;
	}

	public setPermission(permission: PermissionLevel): this {
		if (!this._guildOnly) return this;

		this._permission = permission;
		return this;
	}

	public setEphemeralReply(): this {
		this._ephemeralReply = true;
		return this;
	}

	public build() {
		return {
			data: this as CommandBuilder,
			metadata: {
				active: this._active,
				guildOnly: this._guildOnly,
				ownerOnly: this._ownerOnly,
				permission: this._permission,
				subcommands: this._subcommands,
				ephemeralReply: this._ephemeralReply,
			} satisfies CommandMetadata,
		};
	}
}

export class ContextMenuBuilder extends ContextMenuCommandBuilder {
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
			data: this as ContextMenuBuilder,
			metadata: {
				active: this._active,
				ownerOnly: this._ownerOnly,
				permission: this._permission,
				ephemeralReply: this._ephemeralReply,
			} satisfies ContextMenuMetadata,
		};
	}
}

export default abstract class Command {
	abstract data: SlashCommandBuilder | ContextMenuCommandBuilder;
	abstract metadata: CommandMetadata | ContextMenuMetadata;
	public readonly run?: (client: TriviousClient, interaction: CommandInteraction) => Promise<void>;

	public define() {
		return {
			data: this.data,
			metadata: this.metadata,
		};
	}

	public toJSON() {
		return this.data.toJSON();
	}

	public async reply(
		interaction: CommandInteraction,
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

	async validateGuildPermission(
		interaction: CommandInteraction,
		permission: PermissionLevel,
		doReply: boolean = true
	) {
		if (interaction.isContextMenuCommand() || (this.metadata as CommandMetadata).guildOnly) {
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

	public async execute(client: TriviousClient, interaction: CommandInteraction) {
		const { run, reply } = this;

		if (this.data instanceof ContextMenuBuilder || interaction.isContextMenuCommand()) {
			if (!run) return;

			const memberHasPermission = await this.validateGuildPermission(
				interaction,
				this.metadata.permission,
				false
			);
			if (memberHasPermission) await run(client, interaction);
			return;
		}

		const metadata = this.metadata as CommandMetadata;
		if (run) {
			const memberHasPermission = await this.validateGuildPermission(
				interaction,
				metadata.permission,
				false
			);
			if (memberHasPermission) await run(client, interaction);
		}

		if (run) {
			const memberHasPermission = await this.validateGuildPermission(
				interaction,
				metadata.permission,
				false
			);
			if (memberHasPermission) await run(client, interaction);
		}

		const subcommands = metadata.subcommands;
		if (subcommands.size <= 0) return;

		const { options } = interaction;

		const subcommand = metadata.subcommands.find(
			subcmd => subcmd.data.name === options.getSubcommand()
		);
		if (!subcommand) {
			await reply(interaction, {
				content: "Ran subcommand is outdated or does not have a handler!",
			});
			return;
		}

		const memberHasPermission = await this.validateGuildPermission(
			interaction,
			subcommand.metadata.permission
		);
		if (!memberHasPermission) return;

		await reply(interaction, { content: "Processing command..." });
		await subcommand.execute(client, interaction);
	}
}