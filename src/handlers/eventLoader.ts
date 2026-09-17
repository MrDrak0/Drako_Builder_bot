import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Client } from 'discord.js';
import { logger } from '../utils/logger.js';

export interface DiscordEvent {
  name: string;
  once?: boolean;
  execute: (client: Client, ...args: unknown[]) => Promise<void> | void;
}

// eslint-disable-next-line no-underscore-dangle
const eventsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'events');

/**
 * Imports every file in src/events and wires each default export up as a
 * client listener. Events receive (client, ...args) so handlers can reach the
 * client without a global reference.
 */
export async function loadEvents(client: Client): Promise<void> {
  const files = (await readdir(eventsDir)).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

  for (const file of files) {
    const module = (await import(pathToFileURL(join(eventsDir, file)).href)) as { default?: DiscordEvent };
    if (!module.default?.name) {
      logger.warn(`Skipped event file ${file}: missing default export with a name`);
      continue;
    }
    const event = module.default;
    if (event.once) {
      client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
      client.on(event.name, (...args) => event.execute(client, ...args));
    }
    logger.debug(`Registered event: ${event.name}`);
  }
}