import { createMessageCommand } from "#trivious";

export default createMessageCommand({
	active: true,
	name: "ping-test",
	aliases: ["pt"],
	arguments: [
		{ name: "user", dataType: "snowflake/user", description: "Target user" },
		{ name: "reason", dataType: "text", description: "A good reason" },
		{ name: "duration", dataType: "duration", description: "A duration" },
	] as const,
	async execute(client, interaction) {
		const { args, command, message } = interaction;
		await message.reply({
			content: args.map((value, name) => `[${name}]: ${value}`).join("\n"),
		});
	},
});
