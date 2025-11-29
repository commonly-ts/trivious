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
	}

	async start() {
		if (!process.env[this._options.tokenReference]) {
			if (process.env.NODE_ENV !== "production") return;
			else throw new Error("Invalid token reference");
		}

		await this.login(process.env[this._options.tokenReference]);
		this.registries.bind(this);
	}

	async deploy() {
		const clientId = process.env[this._options.clientIdReference];
		const token = process.env[this._options.tokenReference];
		if (!clientId || !token) throw new Error("Invalid clientId or token reference");

		await this.registries.commands.load(this._options.corePaths.commandsPath);

		const slashCommands = Array.from(this.registries.commands.get().values());
		const body = [...slashCommands.map(command => command.toJSON())];

		const rest = new REST({ version: "10" }).setToken(token);
		await rest.put(Routes.applicationCommands(clientId), { body });
	}
}
