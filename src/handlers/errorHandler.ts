import { BaseInteraction, Colors, DiscordAPIError, EmbedBuilder } from 'discord.js';
import { logger } from '../utils/logger.js';

/**
 * Central error handler for command/interaction failures.
 * Logs the full error and tells the user something went wrong —
 * the specific error is never leaked to end users.
 */
export async function handleCommandError(error: unknown, interaction: BaseInteraction): Promise<void> {
  const name = interaction.isCommand() ? interaction.commandName : interaction.type;
  const detail = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack ?? ''}` : String(error);
  logger.error(`Interaction "${name}" failed:\n${detail}`);

  const embed = new EmbedBuilder()
    .setColor(Colors.Red)
    .setTitle('Something went wrong')
    .setDescription('An unexpected error occurred while running this command. The issue has been logged.');

  try {
    if (!interaction.isRepliable()) {
      logger.warn(`Interaction "${name}" is not repliable; skipping error reply`);
      return;
    }
    if (interaction.deferred || interaction.replied) {
      // Already acknowledged (reply or button update) — only a follow-up works now.
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  } catch (replyError) {
    // 10062 (Unknown interaction) / 40060 (already acknowledged) mean Discord
    // can never accept another response — nothing meaningful to send, so don't
    // log a second, confusing error on top of the original one.
    const code = replyError instanceof DiscordAPIError ? Number(replyError.code) : 0;
    if (code !== 10062 && code !== 40060) {
      logger.error(`Failed to send error reply for "${name}": ${String(replyError)}`);
    }
  }
}