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
  rolePermissions: { // Altneratively can be set via client.rolePermissions
    "123456789012345678": PermissionLevel.GUILD_MODERATOR, // Role ID → PermissionLevel
  },
});

(async () => {
  try {
    await client.register();  // Loads all commands, events, components, modules
    await client.deploy();    // Registers slash commands globally
    await client.start();      // Logs in
  } catch (error) {
    console.error("Failed to start bot:", error);
  }
})();
```

---

### Creating a Slash Command
```ts
// src/core/commands/debug/index.ts
import { CommandBuilder, SlashCommand } from "trivious"

export default class DebugCommand extends SlashCommand {
	constructor() {
		super(new CommandBuilder()
			.setName("debug")
			.setDescription("Debug tools")
			.setGuildOnly()
			.setEphemeralReply())
	}
};
```
> Subcommands go in the same directory as the command file and are auto-detected.

### Creating a Subcommand
```ts
// src/core/commands/debug/ping.ts
import { ChatInputCommandInteraction, Subcommand, SubcommandBuilder, TriviousClient } from "trivious";

export default class DebugPingSubcommand extends Subcommand {
	constructor() {
		super(new SubcommandBuilder()
			.setName("ping")
			.setDescription("Ping pong!")
			.setOwnerOnly())
	}

	execute = async (client: TriviousClient, interaction: ChatInputCommandInteraction) => {
		try {
			const sent = await interaction.fetchReply();
			const latency = sent.createdTimestamp - interaction.createdTimestamp;
			const apiLatency = Math.round(interaction.client.ws.ping);

			await this.reply(interaction, { content: `Pong!\nLatency ${latency}ms API Latency: ${apiLatency}ms` });
		} catch (error: any) {
			console.error(error);
		}
	};
};
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
	"123456": PermissionLevel.GUILD_STAFF
})
```

---

### Context Menu Commands / Components / Events / Modules
All follow the same, clean consistent pattern.
- Context menus -> extend `ContextMenuCOmmand` + `ContextMenuBuilder`
- Buttons/Modals/Select menus -> extend `Component` + use `ComponentBuilder().setCustomId(...)`
- Events -> export an object with `name`, `once?` and `execute`
- Modules -> export an object with events to trigger the module

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
