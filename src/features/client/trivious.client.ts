import registries from "@shared/registries.js";
import { Client, Collection } from "discord.js";
import structure from "../structure/index.structure.js";

import {
	Component,
	ContextCommandData,
	Event,
	Module,
	SlashCommandData,
	TriviousClientOptions,
} from "@typings";
import { TriviousError } from "@utility/errors.js";
import commandDeploy from "./deploy.client.js";
import { Logger } from "./logger.js";

export default class TriviousClient extends Client {
	trivious: TriviousClientOptions;
	readonly stores: {
		commands: {
			chatInput: Collection<string, SlashCommandData>;
			context: Collection<string, ContextCommandData>;
		};
		components: Collection<string, Component>;
		events: Collection<string, Event>;
		modules: Collection<string, Module>;
	};
	logger: Logger;

	constructor(options: TriviousClientOptions) {
		super(options);
		this.trivious = options;
		this.logger = new Logger("Trivious", !!options.debug);

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
		const token = process.env[this.trivious.credentials.tokenReference];
		if (!token) {
			throw new TriviousError(
				`Bot token environment variable '${this.trivious.credentials.tokenReference}' does not exist!`,
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
		const dir = structure.resolveRelativePath(this.trivious.corePath);

		await registries.events.register(this, dir);
		await registries.modules.register(this, dir);
		await registries.commands.register(this, dir);
		await registries.components.register(this, dir);
	}

	async deploy() {
		await commandDeploy(this);
	}
}
