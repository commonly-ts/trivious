import { registry } from "src/features/commands/registry.commands.js";

(async () => {
	const commands = await registry.parse("dist/test/src/features/moderation/commands");

	commands?.forEach((command) => {
		console.log(command.data.name);
		if (command.subcommands)
			command.subcommands.forEach((sub) => console.log("subcommand " + sub.data.name));
		if (command.subcommandGroups)
			command.subcommandGroups.forEach((gr) => {
				console.log("group " + gr.data.name);
				gr.subcommands.forEach((sub) => console.log("group subcommand " + sub.data.name));
			});
	});
})();
