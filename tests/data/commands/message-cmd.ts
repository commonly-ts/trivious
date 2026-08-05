import { createMessageCommand } from "#src/index.js";

export default createMessageCommand({
	active: true,
	name: "ping-test",
	aliases: ["png"],
	arguments: ["type"],
	async execute(client, message, args) {
		await message.reply({ content: `Hello world! Given argument: \`${args.get("type")}\`` });
	},
});
