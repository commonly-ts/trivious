import { TriviousError } from "#shared/utility/errors.js";
import { Client, Collection } from "discord.js";
import type { BaseContextCommandData, SlashCommandData } from "../commands/commands.types.js";
import registerCommands from "../commands/registry.commands.js";
import structure from "../structure/index.structure.js";
import TriviousClientOptions from "./client.types.js";

export default class TriviousClient extends Client {
	_options: TriviousClientOptions;
	readonly stores: {
		commands: {
			chatInput: Collection<string, SlashCommandData>;
			context: Collection<string, BaseContextCommandData>;
		};
		components: Collection<string, string>;
		events: Collection<string, string>;
		modules: Collection<string, string>;
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

		await this.login(token);
	}

	async register() {
		if (this._options.structurePaths.useTypeBasedStructure) {
			const paths = this._options.structurePaths;
			const resolvedPaths = structure.resolveTypeBasedStructure(paths.corePath);

			await registerCommands(this, structure.resolveRelativePath(paths.corePath));
			// await commandRegistry.register(this, resolvedPaths.get("commands") || "commands");
			// console.log(this.stores);

			// const dir = join(paths.corePath, "commands");
			// const commandsPath = structure.resolveRelativePath(dir);
			// console.log(dir, commandsPath);
		}
		// const commands = await commandRegistry.parse(structure.resolveStructurePath("test/src/features/moderation"))

		// const structurePaths = this._options.structurePaths;
		// const paths: Record<string, string> = {
		// 	corePath: "",
		// 	commandsPath: "",
		// 	componentPath: "",
		// 	eventsPath: "",
		// 	modulesPath: "",
		// };

		// const __filename = fileURLToPath(import.meta.url);
		// const __dirname = dirname(__filename);

		// console.log(__filename);
		// console.log(__dirname);

		// if (structurePaths.useTypeBasedStructure) {
		// 	for (const pathType in paths) {
		// 		if (pathType === "useTypeBasedStructure") continue;
		// 		paths[pathType] =
		// 			(structurePaths as any)[pathType] || join(structurePaths.corePath, pathType.split("Path")[0]);
		// 	}

		// 	console.log(pathToFileURL(path.resolve(__dirname, "..", paths.commandsPath)).pathname);
		// 	const commands = await commandRegistry.parse(pathToFileURL(path.resolve(__dirname, "..", paths.commandsPath)).pathname);
		// } else {
		// }

		// const commands = commandRegistry.parse();
	}

	async deploy() {}
}
