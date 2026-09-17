import { Client, Interaction } from 'discord.js';
import { getCommands } from '../handlers/commandLoader.js';
import { handleCommandError } from '../handlers/errorHandler.js';
import { DiscordEvent } from '../handlers/eventLoader.js';
import { handleConfirmationButton } from '../utils/confirmationButton.js';
import { logger } from '../utils/logger.js';

const interactionCreateEvent: DiscordEvent = {
  name: 'interactionCreate',

  async execute(client: Client, rawInteraction: unknown) {
    const interaction = rawInteraction as Interaction;

    // Buttons: Confirm/Cancel on destructive commands.
    if (interaction.isButton()) {
      try {
        if (await handleConfirmationButton(interaction)) return;
        await interaction.reply({ content: 'Unknown button.', ephemeral: true });
      } catch (error) {
        logger.error(`Button "${interaction.customId}" threw an error`);
        await handleCommandError(error, interaction);
      }
      return;
    }

    // Slash commands only from here on.
    if (!interaction.isChatInputCommand()) return;

    const command = getCommands().get(interaction.commandName);
    if (!command) {
      await interaction.reply({
        content: 'This command is no longer registered.',
        ephemeral: true,
      });
      return;
    }

    try {
      await command.execute({ client, interaction });
    } catch (error) {
      logger.error(`Command "${interaction.commandName}" threw an error`);
      await handleCommandError(error, interaction);
    }
  },
};

export default interactionCreateEvent;