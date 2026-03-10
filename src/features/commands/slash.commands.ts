import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandData } from "./commands.types.js";
import { CommandError } from "src/shared/utility/errors.js";
import TriviousClient from "#feature/client/trivious.client.js";

export default async function handleSlashCommand(
	client: TriviousClient,
	command: SlashCommandData,
	interaction: ChatInputCommandInteraction<CacheType>
) {
	try {
		const {} = interaction;
		const { flags } = command;

		if (flags?.includes("RequireCached")) {
			if (!interaction.inCachedGuild()) return;
		}

		if (flags?.includes("DeferReply")) {
		}
	} catch (err: unknown) {
		throw new CommandError((err as Error).message, command);
	}
}
