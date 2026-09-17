# Drako Builder

A Discord bot (built with **discord.js v14** + **TypeScript**) that builds and maintains a complete, ready-to-use Discord server for streamers — roles, channels, and permission overwrites — from a single command.

## What this bot does

Point it at an empty (or existing) Discord server and it will construct the entire server structure for you: an 8-role hierarchy, 7 channel categories with ~39 channels, and every permission overwrite (who can view, who can speak, who can only read) applied automatically and consistently.

It is a **server-construction and inspection tool** — it does not do member-join automation, auto-role assignment, message/voice logging, or a rules-acceptance flow. It builds the server; you run it.

### Role hierarchy it creates

| Role | Purpose |
|---|---|
| 👑 Owner | Full administrator access |
| 🛡️ Management | Server management, roles, channels, moderation tools |
| 🔨 Moderators | Day-to-day moderation |
| 💎 VIP | Supporters/subscribers — access to exclusive channels |
| ⭐ Trusted Members | Elevated community members |
| 👥 Members | Default role for everyone |
| 🤖 Bots | Minimal baseline permissions for bots |
| 🔇 Muted | Punitive role — denied from posting/speaking/reacting everywhere |

### Channel categories it creates

`🏠 WELCOME` · `🎥 STREAM` · `💬 COMMUNITY` · `🎮 GAMING` · `🎙️ VOICE` · `🎫 SUPPORT` · `👑 STAFF`

Each category has its own baseline permissions (e.g. `STAFF` is fully hidden from regular members; announcement-style channels are read-only for `@everyone`), and every individual channel can override that baseline where needed.

## Commands

| Command | What it does |
|---|---|
| `/setup-full` | Builds the entire server (all roles + all channels + overwrites) on a **clean** guild. Refuses to run if the server already has spec roles/channels — run `/delete-server` first if you need a clean rebuild. |
| `/delete-server` | **Destructive.** Deletes all channels, categories, and roles in the server (except `@everyone`, Discord-managed roles, and roles above the bot's own role). Requires clicking a Confirm button. |
| `/scan` | Read-only. Compares the live server against the spec and reports what's missing, extra, or misconfigured. Use this to verify `/setup-full` worked correctly. |
| `/rules` | Posts a rules embed to the channel it's run in. |
| `/ping` | Basic latency/health check. |

## Requirements

- [Node.js](https://nodejs.org/) version **20 or newer**
- A Discord account and a server where you have the **Manage Server** permission
- A Discord Application + Bot Token (created in the next step)

## Installation

### 1. Create a Discord Application and Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and click **New Application**.
2. Open the **Bot** tab → click **Reset Token** to generate a token → copy it (you'll need it in step 4). Keep this secret — anyone with this token has full control of your bot.
3. Still on the **Bot** tab, enable the **Server Members Intent** (required for `/scan`'s member-based checks).
4. Go to **OAuth2 → URL Generator**:
   - Under **Scopes**, check `bot` and `applications.commands`.
   - Under **Bot Permissions**, check **Administrator** (simplest — the bot needs to manage roles, channels, and permissions across the whole server). If you'd rather grant a narrower set, it needs at minimum: Manage Roles, Manage Channels, Manage Guild, View Audit Log.
   - Copy the generated URL, open it in your browser, and invite the bot to your server.

### 2. Get the project running

```bash
# Install dependencies
npm install

# Copy the environment template
cp .env.example .env
```

### 3. Configure `.env`

Open `.env` and fill in:

```env
DISCORD_TOKEN=your-real-bot-token-here
GUILD_ID=your-test-server-id   # optional but recommended
```

- `DISCORD_TOKEN` — the token you copied in step 1. **Never share this or commit it to Git.**
- `GUILD_ID` — the ID of a server to register commands to instantly (right-click your server icon in Discord → Copy Server ID; you need Developer Mode enabled in Discord's settings to see this option). Leave blank to register commands globally instead, which can take up to an hour to appear.

### 4. Build and start

```bash
# Type-check the project
npm run typecheck

# Compile TypeScript to JavaScript
npm run build

# Start the bot
npm start
```

If everything is configured correctly, you'll see a console line like:

```
Registered 5 command(s)
```

The bot is now online. In Discord, type `/` in your server to see the available commands.

### Development mode

```bash
npm run dev
```

Runs the bot directly from TypeScript with auto-reload on file changes — useful while editing, no build step needed.

## Recommended first run

1. Run `/setup-full` in your server (or on a **test server first** — this creates a lot of roles and channels at once).
2. Run `/scan` to confirm everything matches the spec with no issues.
3. If you ever need to start over, run `/delete-server` (confirms before deleting) and then `/setup-full` again.

⚠️ **`/delete-server` permanently deletes every channel and role in the server it's run in.** Always double-check you're running it in the intended server before confirming.

## Project structure

```
src/
├── commands/   # The 5 slash commands
├── config/     # roleSpec.ts and channelSpec.ts — the single source of truth for the server structure
├── events/     # Discord client event handlers
├── handlers/   # Command loading, event loading, error handling
└── utils/      # Shared helpers (rate limiting, name normalization, confirmation buttons, logging)
```

## License

MIT
