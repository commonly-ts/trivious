import {
	CollatedCommandData,
	SlashCommandData,
	SlashSubcommandData,
	SlashSubcommandGroupData,
	TriviousClient,
} from "@typings";
import { TriviousError } from "@utility/errors.js";
import { importFile } from "@utility/functions.js";
import { existsSync, promises as fs } from "fs";
import path from "path";

async function parseBase<T>(input: string | T, expects?: (base: Partial<T>) => boolean) {
	if (typeof input !== "string") {
		if (expects && !expects(input)) return null;
		return input;
	}
	if (!existsSync(input)) return null;
	const base = await importFile<T>(input);
	if (!base) return null;
	if (expects) if (!expects(base)) return base;
	return null;
}

async function parseDirectory(data: CollatedCommandData, directory: string): Promise<void> {
	const files = fs.glob(path.join(directory, "*.{js,ts}"));
	const collatedData: CollatedCommandData = {
		SlashCommand: new Set(),
		SlashSubcommand: new Set(),
		SlashSubcommandGroup: new Set(),
	};
	for await (const file of files) {
		const base = await parseBase<SlashCommandData | SlashSubcommandData | SlashSubcommandGroupData>(
			file,
			(base) => "context" in base && !!base.context
		);
		if (!base) continue;
		const targetSet = data[base.context];
		if (targetSet) {
			(targetSet as Set<typeof base>).add(base);
			(collatedData[base.context] as Set<typeof base>).add(base);
		}
	}
}

export default async function registerCommands(client: TriviousClient, directory: string) {
	if (!existsSync(directory))
		throw new TriviousError(
			`Could not regsiter commands; passed directory ${directory} does not exist`,
			"Nonexistant directory passed"
		);

	const processedDirectories = new Set<string>();
	const files = fs.glob(path.join(directory, "*/**.{js,ts}"));
	const data: CollatedCommandData = {
		SlashCommand: new Set<SlashCommandData>(),
		SlashSubcommand: new Set<SlashSubcommandData>(),
		SlashSubcommandGroup: new Set<SlashSubcommandGroupData>(),
	};

	for await (const file of files) {
		const parentDir = path.dirname(file);
		if (processedDirectories.has(parentDir)) continue;
		processedDirectories.add(parentDir);
		await parseDirectory(data, parentDir);
	}
}
