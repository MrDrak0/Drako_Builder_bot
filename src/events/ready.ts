import { Client } from 'discord.js';
import { deployCommands } from '../handlers/commandLoader.js';
import { DiscordEvent } from '../handlers/eventLoader.js';
import { logger } from '../utils/logger.js';

const readyEvent: DiscordEvent = {
  name: 'ready',
  once: true,

  async execute(client: Client) {
    logger.info(`Logged in as ${client.user?.tag} (${client.user?.id})`);
    try {
      await deployCommands(client);
    } catch (error) {
      logger.error(`Failed to register commands: ${String(error)}`);
    }
  },
};

export default readyEvent;