import { Client, REST, Routes } from "discord.js";
import { TriviousClientOptions } from "src/shared/typings/client.js";
import { registries } from "../registry/index.js";

export default class TriviousClient extends Client {
	public readonly registries = registries();
	private _options: TriviousClientOptions;

	constructor(options: TriviousClientOptions) {
		super(options);
		this._options = options;
	}

	async register() {
		await this.registries.loadAll(this._options);
		console.log(`[Trivious] Loaded ${this.registries.commands.get().size} commands\n${this.registries.components.get().size} components\n${this.registries.events.get().size} events\n${this.registries.modules.get().size} modules`);
	}

	async start() {
		if (!process.env[this._options.tokenReference]) {
			if (process.env.NODE_ENV !== "production") return;
			else throw new Error("Invalid token reference");
		}

		this.registries.bind(this);
		await this.login(process.env[this._options.tokenReference]);
	}

	async deploy() {
		const clientId = process.env[this._options.clientIdReference];
		const token = process.env[this._options.tokenReference];
		if (!clientId || !token) throw new Error("Invalid clientId or token reference");

		const slashCommands = Array.from(this.registries.commands.get().values());
		const body = [...slashCommands.map(command => command.toJSON())];

		const rest = new REST({ version: "10" }).setToken(token);
		await rest.put(Routes.applicationCommands(clientId), { body });
		console.log(`[Trivious] Deployed ${body.length} commands`);
	}
}
