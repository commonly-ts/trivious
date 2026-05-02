# Trivious

Spend less time wiring, and more time writing behaviour.
- declarative handlers
- structured files
- encoded interaction routing
- slash command auto-loading & deployment
- builtin permission handling

Looking for support? Join the Alien Logger server: https://discord.gg/ScY9s6xjFb

---

### Installation

```bash
npm install trivious
yarn add trivious
pnpm add trivious
```

> Requires Node.js 22+

---

### Quick Start

```ts
// src/index.ts
import { TriviousClient } from "trivious";
import { GatewayIntentBits } from "discord.js";

const client = new TriviousClient({
	credentials: {
		tokenReference: "BOT_TOKEN",
		clientIdReference: "CLIENT_ID",
	},
	corePath: "core", // Folder containing your bot's processes
	intents: [GatewayIntentBits.Guilds],
	ownerUserIds: ["1234"],
});

(async () => {
	try {
		await client.start();
		// Registers all commands, events, components, modules;
		// Deploys slash commands globally and then logs into the bot

		// To separately deploy commands - use client.deploy() followed by client.login()
	} catch (err: unknown) {
		const error = err as Error;
		console.error("Failed to start bot:", error);
	}
})();
```

---

### Included Default Events

Trivious automatically includes and inserts `clientReady` and `interactionCreate` handlers, which can be overwritten.
It is recommended to use the default interactionCreate handler, which requires zero setup in your own code.

These default events can be found in `src/features/events/presets` in the Trivious repository.

---

### Code examples
Examples for commands, components, events and modules can be found at https://github.com/commonly-ts/discord-bot-template/tree/main/templates.

---

### Creating a Slash Command

```ts
// commands/debug/index.ts
import { ApplicationCommandType, SlashCommandBuilder } from "discord.js";
import { SlashCommandData } from "trivious";

export default {
	active: true,
	context: "SlashCommand",
	commandType: ApplicationCommandType.ChatInput,
	flags: ["Cached", "EphemeralReply", "DeferReply"],
	data: new SlashCommandBuilder().setName("debug").setDescription("Debug commands"),
} satisfies SlashCommandData;
```

### Creating a Subcommand Group

```ts
// commands/debug/config/index.ts
import { Collection, SlashCommandSubcommandGroupBuilder } from "discord.js";
import { SlashSubcommandGroupData } from "trivious";

export default {
	context: "SlashSubcommandGroup",
	data: new SlashCommandSubcommandGroupBuilder()
		.setName("config")
		.setDescription("Config commands"),
	subcommands: new Collection(),
} satisfies SlashSubcommandGroupData;
```

> Subcommands go in the same directory as the subcommand group file and are auto-detected.

---

### Creating a Subcommand

```ts
// commands/debug/ping.ts
import { ApplicationCommandType, SlashCommandSubcommandBuilder } from "discord.js";
import { interactionReply, SlashSubcommandData } from "trivious";

export default {
	active: true,
	context: "SlashSubcommand",
	commandType: ApplicationCommandType.ChatInput,
	data: new SlashCommandSubcommandBuilder().setName("ping").setDescription("Ping pong!"),

	async execute(client, interaction) {
		const ping = (await interaction.fetchReply()).createdTimestamp - interaction.createdTimestamp;

		await interactionReply({
			interaction,
			replyPayload: {
				content: `Pong!\nBot latency: ${ping}ms, API latency: ${client.ws.ping.toString()}ms`,
			},
			flags: ["EphemeralReply"],
		});
	},
} satisfies SlashSubcommandData;
```

---

### Project Structure

Any project structure (e.g. type-based, feature-based) is acceptable as long as everything you expect to be registered is within the core directory.

For example, if all of your commands, components, events and modules are anywhere inside src/features, assuming they export the correct data, they will be detected and registered to the client.

The only required specific structure is for slash commands, as shown below.

```
command/
├── index.ts*
├── subcommand.ts
└── subcommand-group/
		├── index.ts*
 		└── subcommand.ts

*file name must be exact
```
