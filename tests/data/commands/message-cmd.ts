import { createMessageCommand } from "#trivious";

export default createMessageCommand({
	active: true,
	name: "ping-test",
	description: "test",
	aliases: ["pt"],
	arguments: [
		{ name: "channel", dataType: "snowflake/channel", description: "Target user" },
		{ name: "role", dataType: "snowflake/role", description: "A good reason" },
		{ name: "user", dataType: "snowflake/user", description: "A duration" },
	],
	async execute(client, interaction) {
		const { args, message } = interaction;
		await message.reply({
			content: `Resolved: ${args.get("channel")} ${args.get("role")} ${args.get("user")}`,
		});
	},
});
