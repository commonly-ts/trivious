import {
	Collection,
	ContextMenuCommandBuilder,
	GuildMember,
	InteractionContextType,
	InteractionEditReplyOptions,
	InteractionReplyOptions,
	MessagePayload,
	SlashCommandBuilder,
} from "discord.js";
import {
	CommandInteraction,
	CommandMetadata,
	ContextMenuMetadata,
	PermissionLevel,
} from "src/shared/typings/index.js";
import { ChatInputCommandInteraction, ContextMenuCommandInteraction } from "src/index.js";
import { hasPermission } from "src/shared/utility/functions.js";
import TriviousClient from "../client/trivious.client.js";
import Subcommand from "./subcommand.base.js";

export default abstract class Command {
	abstract data: SlashCommandBuilder | ContextMenuCommandBuilder;
	abstract metadata: CommandMetadata | ContextMenuMetadata;

	public isSlashCommand(this: Command): this is SlashCommand {
		return this.data instanceof SlashCommandBuilder;
	}

	public isContextMenuCommand(this: Command): this is ContextMenuCommand {
		return this.data instanceof ContextMenuCommandBuilder;
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
		const isContextMenu = interaction.isContextMenuCommand();
		const isChatInput = interaction.isChatInputCommand();

		const requiresGuildCheck = isContextMenu || (isChatInput && (this.isSlashCommand() ? this.metadata.guildOnly : false));
		if (!requiresGuildCheck) return true;

		const member = interaction.member as GuildMember;
		const memberHasPermission = hasPermission({ permission, member });

		if (!memberHasPermission && doReply) {
			await this.reply(interaction, {
				content: `You do not have permission to run this command, required permission: \`${PermissionLevel[permission]}\``
			});
		}

		return memberHasPermission;
	}
}

export abstract class SlashCommand extends Command {
	abstract data: SlashCommandBuilder;
	abstract metadata: CommandMetadata;
	abstract run?: (client: TriviousClient, interaction: ChatInputCommandInteraction) => Promise<void>;

	public async execute(client: TriviousClient, interaction: ChatInputCommandInteraction) {
		const { run, reply, metadata } = this;
		const { options } = interaction;

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

		await subcommand.execute(client, interaction);
	}
}

export abstract class ContextMenuCommand extends Command {
	abstract data: ContextMenuCommandBuilder;
	abstract metadata: ContextMenuMetadata;
	abstract run: (client: TriviousClient, interaction: ContextMenuCommandInteraction) => Promise<void>;

	public async execute(client: TriviousClient, interaction: ContextMenuCommandInteraction) {
		const { run, metadata } = this;

		const memberHasPermission = await this.validateGuildPermission(
			interaction,
			metadata.permission,
			false
		);
		if (memberHasPermission) await run(client, interaction);
	}
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
		this._ownerOnly = true;
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

