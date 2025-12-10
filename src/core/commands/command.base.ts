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
	AnyCommandBuilder,
	AnyCommandMetadata,
	CommandInteraction,
	CommandMetadata,
	ContextMenuMetadata,
	PermissionLevel,
} from "src/shared/typings/index.js";
import {
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	Subcommand,
} from "src/index.js";
import TriviousClient from "../client/trivious.client.js";
import { hasPermission } from "src/shared/utility/functions.js";

/**
 * Base class for a Command.
 *
 * @export
 * @abstract
 * @class Command
 * @typedef {Command}
 */
export default abstract class Command {
	public readonly data: SlashCommandBuilder | ContextMenuCommandBuilder;
	public readonly metadata: AnyCommandMetadata;

	protected constructor(builder: AnyCommandBuilder) {
		const { data, metadata } = builder.build();
		this.data = data;
		this.metadata = metadata;
	}

	/**
	 * Returns whether the command is a SlashCommand.
	 *
	 * @public
	 * @param {Command} this
	 * @returns {this is SlashCommand}
	 */
	public isSlashCommand(this: Command): this is SlashCommand {
		return this instanceof SlashCommand;
	}

	/**
	 * Returns whether the command is a ContextMenuCommand.
	 *
	 * @public
	 * @param {Command} this
	 * @returns {this is ContextMenuCommand}
	 */
	public isContextMenuCommand(this: Command): this is ContextMenuCommand {
		return this instanceof ContextMenuCommand;
	}

	/**
	 * Returns JSON of the command builder.
	 *
	 * @public
	 * @returns {*}
	 */
	public toJSON() {
		return this.data.toJSON();
	}

	/**
	 * Reply to the interaction respecting command metadata and if the interaction has already been replied to.
	 *
	 * @public
	 * @async
	 * @param {CommandInteraction} interaction
	 * @param {(MessagePayload | InteractionEditReplyOptions | InteractionReplyOptions)} options
	 * @returns {*}
	 */
	public async reply(
		interaction: CommandInteraction,
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

	/**
	 * Validate permissions for a user/member in a guild.
	 *
	 * @async
	 * @param {CommandInteraction} interaction
	 * @param {PermissionLevel} permission
	 * @param {boolean} [doReply=true]
	 * @returns {unknown}
	 */
	async validateGuildPermission(
		client: TriviousClient,
		interaction: CommandInteraction,
		permission: PermissionLevel,
		doReply: boolean = true
	) {
		if (!interaction.inGuild()) return true;

		const member = interaction.member as GuildMember;
		const memberHasPermission = hasPermission(client, { permission, member });

		if (!memberHasPermission && doReply) {
			await this.reply(interaction, {
				content: `You do not have permission to run this command, required permission: \`${PermissionLevel[permission]}\``,
			});
		}

		return memberHasPermission;
	}
}

/**
 * Base SlashCommand.
 *
 * @export
 * @abstract
 * @class SlashCommand
 * @typedef {SlashCommand}
 * @extends {Command}
 */
export abstract class SlashCommand extends Command {
	declare public readonly data: SlashCommandBuilder;
	declare public readonly metadata: CommandMetadata;

	protected constructor(builder: CommandBuilder) {
		super(builder);
	}

	/**
	 * Optional function to run if the SlashCommand has no subcommands or for extra fuctionality.
	 *
	 * @abstract
	 */
	run?: (client: TriviousClient, interaction: ChatInputCommandInteraction) => Promise<void>;

	/**
	 * General handler for the command and its subcommand, if applicable.
	 *
	 * @public
	 * @async
	 * @param {TriviousClient} client
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {*}
	 */
	public async execute(client: TriviousClient, interaction: ChatInputCommandInteraction) {
		const { metadata } = this;
		const { options } = interaction;

		if (!options.getSubcommand(false)) {
			if (this.run) {
				const hasPerm = await this.validateGuildPermission(
					client,
					interaction,
					metadata.permission,
					false
				);
				if (hasPerm) await this.run(client, interaction);
			}
			return;
		}

		const subcommandName = options.getSubcommand();
		const subcommand = metadata.subcommands.get(subcommandName);

		if (!subcommand) {
			await this.reply(interaction, {
				content: "This subcommand no longer exists or is not registered.",
			});
			return;
		}

		const hasPerm = await this.validateGuildPermission(
			client,
			interaction,
			subcommand.metadata.permission
		);
		if (!hasPerm) return;

		await subcommand.execute(client, interaction);
	}
}

/**
 * Base CommandBuilder.
 *
 * @export
 * @class CommandBuilder
 * @typedef {CommandBuilder}
 * @extends {SlashCommandBuilder}
 */
export class CommandBuilder extends SlashCommandBuilder {
	private _active = true;
	private _guildOnly = false;
	private _ownerOnly = false;
	private _permission = PermissionLevel.USER;
	private _subcommands = new Collection<string, Subcommand>();
	private _ephemeralReply = false;

	/**
	 * Set the command as disabled.
	 *
	 * @public
	 * @returns {this}
	 */
	public disable(): this {
		this._active = false;
		return this;
	}

	/**
	 * Set the command as guild only.
	 *
	 * @public
	 * @returns {this}
	 */
	public setGuildOnly(): this {
		this._guildOnly = true;
		this._permission = PermissionLevel.USER;
		this.setContexts(InteractionContextType.Guild);
		return this;
	}

	/**
	 * Set the command as public only.
	 *
	 * @public
	 * @returns {this}
	 */
	public setOwnerOnly(): this {
		this._ownerOnly = true;
		this._permission = PermissionLevel.BOT_OWNER;
		return this;
	}

	/**
	 * Set the permission level required to run the command.
	 *
	 * @public
	 * @param {PermissionLevel} permission
	 * @returns {this}
	 */
	public setPermission(permission: PermissionLevel): this {
		if (!this._guildOnly) return this;
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
	 * Build the builder.
	 *
	 * @public
	 * @returns {{ data: CommandBuilder; metadata: CommandMetadata; }}
	 */
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

/**
 * Base ContextMenuCommand.
 *
 * @export
 * @abstract
 * @class ContextMenuCommand
 * @typedef {ContextMenuCommand}
 * @extends {Command}
 */
export abstract class ContextMenuCommand extends Command {
	declare public readonly data: ContextMenuCommandBuilder;
	declare public readonly metadata: ContextMenuMetadata;

	protected constructor(builder: ContextMenuBuilder) {
		super(builder);
	}

	/**
	 * Function to run when the command is used.
	 *
	 * @abstract
	 */
	abstract run: (
		client: TriviousClient,
		interaction: ContextMenuCommandInteraction
	) => Promise<void>;

	/**
	 * Base command handler.
	 *
	 * @public
	 * @async
	 * @param {TriviousClient} client
	 * @param {ContextMenuCommandInteraction} interaction
	 * @returns {*}
	 */
	public async execute(client: TriviousClient, interaction: ContextMenuCommandInteraction) {
		const hasPerm = await this.validateGuildPermission(
			client,
			interaction,
			this.metadata.permission
		);
		if (hasPerm) await this.run(client, interaction);
	}
}

/**
 * Base ContextMenuBuilder.
 *
 * @export
 * @class ContextMenuBuilder
 * @typedef {ContextMenuBuilder}
 * @extends {ContextMenuCommandBuilder}
 */
export class ContextMenuBuilder extends ContextMenuCommandBuilder {
	private _active = true;
	private _ownerOnly = false;
	private _permission = PermissionLevel.USER;
	private _ephemeralReply = false;

	/**
	 * Set the command as disabled.
	 *
	 * @public
	 * @returns {this}
	 */
	public disable(): this {
		this._active = false;
		return this;
	}

	/**
	 * Set the command as owner only.
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
	 * Set the permission level required to run the command.
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
	 * Build the builder
	 *
	 * @public
	 * @returns {{ data: ContextMenuBuilder; metadata: ContextMenuMetadata; }}
	 */
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
