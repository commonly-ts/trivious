import { CommandFlags, SlashCommandData, TriviousClient } from "#typings";
import { ChatInputCommandInteraction } from "discord.js";
import { interactionReply } from "../methods.commands.js";

async function handleFlags(interaction: ChatInputCommandInteraction, flags?: CommandFlags[]) {
	if (flags?.includes("Cached") && !interaction.inCachedGuild()) return;
	if (flags?.includes("ExpectModal")) return;
	if (flags?.includes("DeferReply")) {
		await interactionReply({
			interaction,
			flags: flags,
			replyPayload: { content: "Processing command..." },
		});
	}
}

export async function handleSlashCommand(
	client: TriviousClient,
	command: SlashCommandData,
	interaction: ChatInputCommandInteraction
) {
	const { options } = interaction;

	const subcommandGroup = options.getSubcommandGroup(false);
	const subcommand = options.getSubcommand(false);

	if (!subcommandGroup && !subcommand) {
		await handleFlags(interaction, command.flags);

		if ("run" in command && command.run) {
			try {
				await command.run(client, interaction);
			} catch (err: any) {
				console.error(err);
			}
		}

		return;
	}

	if (subcommandGroup && command.subcommandGroups && subcommand) {
		const foundGroup = command.subcommandGroups.get(subcommandGroup);
		if (!foundGroup) {
			await interactionReply({
				interaction,
				flags: ["EphemeralReply"],
				replyPayload: {
					content: "Subcommand group is outdated, inactive, or does not have a handler!",
				},
			});
			return;
		}

		const foundSubcommand = foundGroup.subcommands.get(subcommand);
		if (!foundSubcommand) {
			await interactionReply({
				interaction,
				flags: ["EphemeralReply"],
				replyPayload: { content: "Subcommand is outdated, inactive, or does not have a handler!" },
			});
			return;
		}

		await handleFlags(interaction, foundSubcommand.flags || command.flags);
		return await foundSubcommand.execute(client, interaction);
	} else if (subcommand && command.subcommands) {
		const foundSubcommand = command.subcommands.get(subcommand);
		if (!foundSubcommand) {
			await interactionReply({
				interaction,
				flags: ["EphemeralReply"],
				replyPayload: { content: "Subcommand is outdated, inactive, or does not have a handler!" },
			});
			return;
		}

		await handleFlags(interaction, foundSubcommand.flags || command.flags);
		return await foundSubcommand.execute(client, interaction);
	} else {
		await interactionReply({
			interaction,
			flags: ["EphemeralReply"],
			replyPayload: { content: "Command is outdated, inactive, or does not have a handler!" },
		});
	}
}
