import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { loadEvents } from './src/handlers/eventLoader.js';
import { logger } from './src/utils/logger.js';
const token = process.env.DISCORD_TOKEN;
if (!token) {
    logger.error('DISCORD_TOKEN is missing. Copy .env.example to .env and fill it in.');
    process.exit(1);
}
// Intents: Guilds (slash commands) + GuildMembers (member lists for /scan).
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
    ],
});
await loadEvents(client);
client
    .login(token)
    .then(() => logger.info('Login successful'))
    .catch((error) => {
    logger.error(`Login failed: ${String(error)}`);
    process.exit(1);
});
