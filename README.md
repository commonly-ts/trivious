# Trivious Framework

Easy to use framework for efficiently creating Dicord.js bots.

## Getting Started
```
npm install trivious
pnpm add trivious
```

### Initialization
```ts
const client = new TriviousClient({
	// References are the names of environment variables i.e. process.env.BOT_TOKEN
	tokenReference: "BOT_TOKEN", clientIdReference: "CLIENT_ID",

	// Points to src/core e.g. src/core/commands
	corePath: "core",

	// Normal discord.js client intents
	intents: [GatewayIntentBits.Guilds],
});


await client.register(); // Load commands & events
await client.deploy(); // Deploy commands to Discord
await client.start(); // Start the bot
```

### Commands
Example debug slash command with guild admin level permission, ephemeral reply, and guild-only.
```ts
// src/core/commands/debug/index.ts
const { data, metadata } = new CommandBuilder()
	.setName("debug")
	.setDescription("Debugging tools")
	.setPermission(PermissionLevel.GUILD_ADMINISTRATOR)
	.setEphemeralReply()
	.setGuildOnly()
	.build();

export default class DebugCommand extends Command {
	data = data;
	metadata = metadata;
};
```

Example subcommand for the debug command.
```ts
// src/core/commands/debug/ping.ts
const { data, metadata } = new SubcommandBuilder()
	.setName("ping")
	.setDescription("Ping pong!")
	.build();

export default class DebugPingSubcommand extends Subcommand {
	data = data;
	metadata = metadata;
	execute = async (client: TriviousClient, interaction: ChatInputCommandInteraction<CacheType>) => {
		try {
			const sent = await interaction.fetchReply();
			const latency = sent.createdTimestamp - interaction.createdTimestamp;
			const apiLatency = Math.round(interaction.client.ws.ping);

			// The inhereited reply method allows for safe replying to the interaction.
			await this.reply(interaction, { content: `Pong!\nLatency ${latency}ms API Latency: ${apiLatency}ms` });
		} catch (error: any) {
			console.error(error);
		}
	};
};
```
