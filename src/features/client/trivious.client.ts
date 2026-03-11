import { TriviousError } from "#shared/utility/errors.js";
import { Client } from "discord.js";
import path, { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { registry as commandRegistry } from "../commands/registry.commands.js";
import TriviousClientOptions from "./client.types.js";

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
			throw new TriviousError(
				`Bot token environment variable '${this._options.credentials.tokenRefernece}' does not exist!`,
				"Null environment variable"
			);
		}

		await this.register();
		await this.deploy();

		await this.login(token);
	}

	async register() {
		const structurePaths = this._options.structurePaths;
		const paths: Record<string, string> = {
			corePath: "",
			commandsPath: "",
			componentPath: "",
			eventsPath: "",
			modulesPath: "",
		};

		const __filename = fileURLToPath(import.meta.url);
		const __dirname = dirname(__filename);

		console.log(__filename);
		console.log(__dirname);

		if (structurePaths.useTypeBasedStructure) {
			for (const pathType in paths) {
				if (pathType === "useTypeBasedStructure") continue;
				paths[pathType] =
					(structurePaths as any)[pathType] || join(structurePaths.corePath, pathType.split("Path")[0]);
			}

			console.log(pathToFileURL(path.resolve(__dirname, "..", paths.commandsPath)).pathname);
			const commands = await commandRegistry.parse(pathToFileURL(path.resolve(__dirname, "..", paths.commandsPath)).pathname);
		} else {
		}

		// const commands = commandRegistry.parse();
	}

	async deploy() {}
}
