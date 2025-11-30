# Trivious

Easy to use, modular and extensible Discord.js v14 framework.

---

### Features
- **Registry-based loading** - Auto-loads commands, events, components and modules from folders
- **Declarative command builders** with metadata (permissions, ephemeral, guild-only, etc)
- **Built-in permission system** with customisable role-based levels
- **Subcommand support** with independent permissions
- **Context menu commands** with the same permission & metadata system'
- **Component handlers** with custom id tagging and permission checks
- **Smart reply handling** - Automatically respects `ephemeralReply` and `interaction.replied`
- **One-command deploy** - `client.deploy()` pushes all commands globally
- **Zero boilerplate** - Less repetitive code, more focus on logic

---

### Installation
```bash
npm install trivious
# or
yarn add trivious
# or
pnpm add trivious
```
> Requires discord.js v14+ and Node.js 18+

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
import { CommandBuilder, Command, PermissionLevel } from "trivious";

const { data, metadata } = new CommandBuilder()
  .setName("debug")
  .setDescription("Debugging tools")
  .setGuildOnly()
  .setPermission(PermissionLevel.GUILD_ADMINISTRATOR)
  .setEphemeralReply()
  .build();

export default class DebugCommand extends Command {
  data = data;
  metadata = metadata;

  // Optional: run when no subcommand is used
  async run?(client, interaction) {
    await this.reply(interaction, { content: "Use a subcommand!" });
  }
}
```
> Subcommands go in the same directory as the command file and are auto-detected.

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
