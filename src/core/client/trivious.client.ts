import { Client, REST, Routes } from "discord.js";
import { registries } from "../registry/index.js";
import { TriviousClientOptions, PermissionLevel } from "src/shared/typings/index.js";
import { exists, hashCommands } from "src/shared/utility/functions.js";
import path from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

/**
 * Trivious base client.
 *
 * @export
 * @class TriviousClient
 * @typedef {TriviousClient}
 * @extends {Client}
 */
export default class TriviousClient extends Client {
	/**
	 * Client registries.
	 *
	 * @public
	 * @readonly
	 * @type {*}
	 */
	public readonly registries = registries();
	/**
	 * Client copy of the constructor options.
	 *
	 * @private
	 * @type {TriviousClientOptions}
	 */
	public readonly _options: TriviousClientOptions;

	/**
	 * Creates an instance of TriviousClient.
	 *
	 * @constructor
	 * @param {TriviousClientOptions} options
	 */
	constructor(options: TriviousClientOptions) {
		super(options);
		this._options = options;
	}

	/**
	 * Load all registries.
	 *
	 * @async
	 * @returns {*}
	 */
	async register() {
		const { registries } = this;
		await registries.loadAll(this._options);
		console.log(
			`[Trivious] Loaded all registries (${registries.commands.get().size} commands, ${registries.events.get().size} events, ${registries.components.get().size} components, ${registries.modules.get().size} modules)`
		);
	}

	/**
	 * Login and start the bot.
	 *
	 * @async
	 * @returns {*}
	 */
	async start() {
		if (!process.env[this._options.tokenReference]) {
			if (process.env.NODE_ENV !== "production") return;
			else throw new Error("[Trivious] Invalid token reference");
		}

		this.registries.bind(this);
		await this.login(process.env[this._options.tokenReference]);
	}

	/**
	 * Deploy all commands.
	 *
	 * @async
	 * @returns {*}
	 */
	async deploy() {
		const { commandHashConfig } = this._options;
		const clientId = process.env[this._options.clientIdReference];
		const token = process.env[this._options.tokenReference];
		if (!clientId || !token) throw new Error("[Trivious] Invalid clientId or token reference");

		const commands = Array.from(this.registries.commands.get().values());
		const body = [...commands.map(command => command.toJSON())];

		if (commandHashConfig && commandHashConfig.enabled) {
			const hashFile = path.join(commandHashConfig.filePath || "data", "commands.hash");
			const newHash = await hashCommands(body);
			let oldHash = "";

			if (await exists(hashFile)) oldHash = readFileSync(hashFile, "utf-8");
			if (newHash === oldHash) {
				console.debug(`[Trivious] No changes in commands found, skipping deployment`);
				return;
			}

			const hashDirectory = path.dirname(hashFile);
			if (!existsSync(hashDirectory)) {
				mkdirSync(hashDirectory, { recursive: true });
			}

			writeFileSync(hashFile, newHash, { encoding: "utf-8", });
			console.debug(`[Trivious] Created new command hash: ${hashFile}`);
		}

		const rest = new REST({ version: "10" }).setToken(token);
		await rest.put(Routes.applicationCommands(clientId), { body });
		console.log(`[Trivious] Deployed ${body.length} commands`);
	}

	/**
	 * Set the roles tied to a permission level.
	 *
	 * @param {Record<string, PermissionLevel>} roles
	 */
	setRolePermissions(roles: Record<string, PermissionLevel>) {
		this._options.rolePermissions = roles;
	}

	get rolePermissions() {
		return this._options.rolePermissions ?? {};
	}
}
