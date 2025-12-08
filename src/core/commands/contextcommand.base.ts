import { ContextMenuCommandBuilder } from "discord.js";
import { ContextMenuMetadata } from "src/shared/typings/commands.js";
import { Command, ContextMenuCommandInteraction, PermissionLevel } from "src/index.js";
import TriviousClient from "../client/trivious.client.js";

/**
 * Base ContextMenuCommand.
 *
 * @export
 * @abstract
 * @class ContextMenuCommand
 * @typedef {ContextMenuCommand}
 * @extends {Command}
 */
export default abstract class ContextMenuCommand extends Command {
	abstract data: ContextMenuCommandBuilder;
	abstract metadata: ContextMenuMetadata;
	/**
	 * Function to run when the command is used.
	 *
	 * @abstract
	 * @type {(
	 * 		client: TriviousClient,
	 * 		interaction: ContextMenuCommandInteraction
	 * 	) => Promise<void>}
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
		const { run, metadata } = this;

		const memberHasPermission = await this.validateGuildPermission(
			client,
			interaction,
			metadata.permission,
			false
		);
		if (memberHasPermission) await run(client, interaction);
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
