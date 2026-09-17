import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { logger } from '../utils/logger.js';
/** Commands directory as seen from this file (works in dev via tsx and in dist/). */
// eslint-disable-next-line no-underscore-dangle
const commandsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'commands');
let commands = null;
async function loadCommands() {
    if (commands)
        return commands;
    const found = new Map();
    const files = (await readdir(commandsDir)).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));
    for (const file of files) {
        const module = (await import(pathToFileURL(join(commandsDir, file)).href));
        if (!module.default || !module.default.data) {
            logger.warn(`Skipped ${file}: missing default export with a SlashCommandBuilder`);
            continue;
        }
        found.set(module.default.data.name, module.default);
    }
    commands = found;
    return found;
}
export function getCommands() {
    return commands ?? new Map();
}
/**
 * Registers all slash commands. If GUILD_ID is set the commands are scoped to
 * that guild (instant updates, ideal for a test server); otherwise they are
 * registered globally, which can take up to an hour to propagate.
 */
export async function deployCommands(client) {
    const loaded = await loadCommands();
    const payload = [...loaded.values()].map((command) => command.data.toJSON());
    const target = process.env.GUILD_ID;
    if (target) {
        const guild = await client.guilds.fetch(target);
        await guild.commands.set(payload);
        logger.info(`Registered ${payload.length} command(s) in guild ${target}`);
        // Clear any stale GLOBAL commands from earlier runs, otherwise they keep
        // showing up in every server (including this test guild) — the project
        // always registers guild-scoped, so no globals should survive.
        if (client.application) {
            await client.application.commands.set([]);
            logger.info('Cleared all global commands (guild-scoped registration only)');
        }
    }
    else if (client.application) {
        await client.application.commands.set(payload);
        logger.info(`Registered ${payload.length} command(s) globally`);
    }
    else {
        logger.warn('client.application unavailable; commands were not registered');
    }
}
