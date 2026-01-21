# Trivious

Discord.js framework

---

### Installation

```bash
npm install trivious
yarn add trivious
pnpm add trivious
```

> Requires Node.js 18+

---

### Quick Start

```ts
// src/index.ts
import { TriviousClient, PermissionLevel } from "trivious";
import { GatewayIntentBits } from "discord.js";

const client = new TriviousClient({
	tokenReference: "BOT_TOKEN",
	clientIdReference: "CLIENT_ID",
	corePath: "core", // Folder containing commands/, events/, components/, modules/
	intents: [GatewayIntentBits.Guilds],
	rolePermissions: {
		// Altneratively can be set via client.rolePermissions
		"123456789012345678": PermissionLevel.GUILD_MODERATOR, // Role ID → PermissionLevel
	},
});

(async () => {
	try {
		await client.start();
		// Registers all commands, events, components, modules;
		// Deploys slash commands globally and then logs into the bot

		// To separately register commands, events, etc - use client.register()
		// To separately deploy commands - use client.deploy() followed by client.login()
	} catch (error) {
		console.error("Failed to start bot:", error);
	}
})();
```

---

### Included Default Events

Trivious automatically includes and inserts `clientReady` and `interactionCreate` handlers, which can be overwritten.
It is recommended to use the default interactionCreate handler, which requires zero input in your own code.

These default events can be found in `src/core/events` in the Trivious repository.

---

### Creating a Slash Command

```ts
// src/core/commands/debug/index.ts
import { SlashCommandBuilder } from "discord.js";
import { PermissionLevel, SlashCommand } from "trivious";

export default {
	active: true,
	context: "SlashCommand",
	flags: ["OwnerOnly", "GuildOnly", "EphemeralReply", "DeferReply"],
	permission: PermissionLevel.BOT_OWNER,
	data: new SlashCommandBuilder().setName("debug").setDescription("Debug commands"),
} satisfies SlashCommand; // recommended for type-safety
```

> Subcommands go in the same directory as the command file and are auto-detected.

### Creating a Subcommand

```ts
// src/core/commands/debug/ping.ts
import { SlashCommandSubcommandBuilder } from "discord.js";
import { commandReply, SlashSubcommand } from "trivious";

export default {
	active: true,
	context: "SlashSubcommand",
	data: new SlashCommandSubcommandBuilder().setName("ping").setDescription("Ping pong!"),

	async execute(client, interaction) {
		const ping = (await interaction.fetchReply()).createdTimestamp - interaction.createdTimestamp;

		await commandReply(this, interaction, {
			content: `Pong!\nBot latency: ${ping}ms, API latency: ${client.ws.ping.toString()}ms`,
		});
	},
} satisfies SlashSubcommand; // recommended for type-safety
```

---

### Permission Levels

```ts
enum PermissionLevel {
	USER = 0,
	GUILD_STAFF = 1,
	GUILD_MODERATOR = 2,
	GUILD_ADMINISTRATOR = 3,
	GUILD_OWNER = 4,
	BOT_OWNER = 5,
}
```

Set role permissions in client options

```ts
rolePermissions: {
	"987654321098765432": PermissionLevel.GUILD_ADMINISTRATOR,
	moderatorRole.id: PermissionLevel.GUILD_MODERATOR,
}
```

Or dynamically at runtime:

```ts
client.setRolePermissions({
	"123456": PermissionLevel.GUILD_STAFF,
});
```

---

### Recommended Project Structure

```
src/
├── core/
│   ├── commands/
│   │   └── debug/
│   │       ├── index.ts
│   │       └── ping.ts
│   ├── events/
│   │   └── ready.ts
│   ├── components/
│   │   └── ticket-create.ts
│   └── modules/
│       └── logging.ts
└── index.ts
```
