import type {
	BaseContextCommandData,
	Component,
	Event,
	Module,
	SlashCommandData,
	TriviousClientOptions,
} from "#typings";
import { TriviousError } from "#utility/errors.js";
import { Client, Collection } from "discord.js";
import registries from "src/shared/registries.js";
import structure from "../structure/index.structure.js";

export default class TriviousClient extends Client {
	_options: TriviousClientOptions;
	readonly stores: {
		commands: {
			chatInput: Collection<string, SlashCommandData>;
			context: Collection<string, BaseContextCommandData>;
		};
		components: Collection<string, Component>;
		events: Collection<string, Event>;
		modules: Collection<string, Module>;
	};

	constructor(options: TriviousClientOptions) {
		super(options);
		this._options = options;

		this.stores = {
			commands: {
				chatInput: new Collection(),
				context: new Collection(),
			},
			components: new Collection(),
			events: new Collection(),
			modules: new Collection(),
		};
	}

	/**
	 * Register, deploy and log into the bot.
	 *
	 * @throws {TriviousError} If invalid bot token
	 */
	async start() {
		const token = process.env[this._options.credentials.tokenRefernece];
		if (!token) {
			throw new TriviousError(
				`Bot token environment variable '${this._options.credentials.tokenRefernece}' does not exist!`,
				"Null environment variable"
			);
		}

		await this.register();
		await this.deploy();

		try {
			await registries.events.bind(this);
			await registries.modules.bind(this);
		} catch (err: any) {
			const error = new TriviousError(err.message, "Error during events and modules binds");
			console.error(error);
		}

		await this.login(token);
	}

	async register() {
		const dir = structure.resolveRelativePath(this._options.corePath);

		await registries.events.register(this, dir);
		await registries.modules.register(this, dir);
		await registries.commands.register(this, dir);
		await registries.components.register(this, dir);

		console.log(this.stores);
	}

	async deploy() {}
}
