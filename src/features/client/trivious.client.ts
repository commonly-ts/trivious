import { Client } from "discord.js";
import TriviousClientOptions from "./client.types.js";
import { TriviousError } from "#shared/utility/errors.js";

export default class TriviousClient extends Client {
	_options: TriviousClientOptions;

	constructor(options: TriviousClientOptions) {
		super(options);
		this._options = options;
	}

	/**
	 * Register, deploy and log into the bot.
	 *
	 * @throws {TriviousError} If invalid bot token
	 */
	async start() {
		const token = process.env[this._options.credentials.tokenRefernece];
		if (!token) {
			throw new TriviousError(`Bot token environment variable '${this._options.credentials.tokenRefernece}' does not exist!`, "Null environment variable");
		}

		await this.register();
		await this.deploy();

		await this.login(token);
	}

	async register() {

	}

	async deploy() {

	}
}