import { createHash } from "crypto";
import { REST, Routes } from "discord.js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { TriviousError } from "src/utility/errors.js";
import { MessageCommandData, UserCommandData } from "../commands/commands.types.js";
import TriviousClient from "./trivious.client.js";

export default async function commandDeploy(client: TriviousClient) {
	const { commandHashConfig } = client.trivious;

	const clientId = process.env[client.trivious.credentials.clientIdReference];
	const token = process.env[client.trivious.credentials.tokenReference];
	if (!clientId || !token)
		throw new TriviousError("Invalid clientId or token environment variable");

	const commands = client.stores.commands;
	const body = [
		...commands.chatInput.map((command) => command.data.toJSON()),
		...commands.context.map((command) =>
			(command as UserCommandData | MessageCommandData).data.toJSON()
		),
	];

	if (commandHashConfig && commandHashConfig.enabled) {
		const hashFile = join(commandHashConfig.persistentDataPath || "data", "commands.hash");
		const newHash = createHash("sha256")
			.update(JSON.stringify(body.sort((a, b) => a.name.localeCompare(b.name))).toString())
			.digest("hex");

		let oldHash = "";
		if (existsSync(hashFile)) oldHash = readFileSync(hashFile, "utf-8");

		if (newHash === oldHash) {
			console.debug(`[Trivious] No changes in commands found, skipping deployment.`);
			return;
		}

		const hashDirectory = dirname(hashFile);
		if (!existsSync(hashDirectory)) {
			mkdirSync(hashDirectory, { recursive: true });
		}

		writeFileSync(hashFile, newHash, { encoding: "utf-8" });
		console.debug(`[Trivious] Created new command hash: ${hashFile}`);
	}

	const rest = new REST({ version: "10" }).setToken(token);
	await rest.put(Routes.applicationCommands(clientId), { body });
	console.debug(`[Trivious] Deployed ${body.length} commands`);
}
