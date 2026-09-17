import { Colors, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { Command } from '../handlers/commandLoader.js';
import { requestConfirmation } from '../utils/confirmationButton.js';
import { logger } from '../utils/logger.js';
import { BULK_SPACING_MS, sleep } from '../utils/rateLimit.js';

/**
 * /delete-server — Deletes **all** channels, categories and roles in the server
 * (except @everyone, managed roles and roles above the bot's highest role).
 * Destructive commands always gate on a Confirm/Cancel button.
 * Targets **all** current server resources, not only those created by the setup.
 */
const deleteServerCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('delete-server')
    .setDescription('Deletes ALL channels, categories and roles in this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute({ interaction }) {
    const guild = interaction.guild;
    if (!guild) return;

    const confirmed = await requestConfirmation(interaction, {
      title: 'Delete entire server?',
      description:
        'This will permanently delete **every** channel, category and role in this server.\n' +
        '@everyone, integration-managed roles and roles above the bot\'s highest role **cannot** be deleted.\n' +
        'This action **cannot be undone**.',
      confirmLabel: 'Yes, delete everything',
    });

    if (!confirmed) {
      await interaction.followUp({ content: 'Cancelled. Nothing was deleted.', ephemeral: true });
      return;
    }

    // No deferReply here: the interaction was already acknowledged by the
    // confirmation embed (reply) and again by the button click (update).
    // Final results are sent via followUp instead.

    const me = guild.members.me;
    const myTopPosition = me?.roles.highest.position ?? 0;

    const failedChannels: string[] = [];
    const failedRoles: string[] = [];

    // 1. Delete ALL text and voice channels (categories included)
    const channels = await guild.channels.fetch();
    const channelsSnapshot = [...channels.values()];
    for (const channel of channelsSnapshot) {
      if (channel === null) continue;
      // Channels have no role-hierarchy relationship — deletion is safe for any
      // channel the bot can manage. Only ROLES get the "above the bot" check.

      try {
        // Spacing per bulk-write rules
        await sleep(BULK_SPACING_MS);
        await channel.delete();
        logger.info(`Purged channel: ${channel.name} (${channel.type})`);
      } catch (error) {
        failedChannels.push(channel.name);
        logger.warn(`Failed to purge channel ${channel.name}: ${String(error)}`);
      }
    }

    // 2. Delete ALL roles (except protected)
    const roles = await guild.roles.fetch();
    const rolesSnapshot = [...roles.values()];
    let protectedRoles = 0;
    for (const role of rolesSnapshot) {
      // Protect @everyone
      if (role.id === guild.roles.everyone.id) {
        protectedRoles += 1;
        continue;
      }
      // Protect roles above bot's highest role
      if (role.position >= myTopPosition) {
        protectedRoles += 1;
        continue;
      }
      // Protect managed roles (bots, integrations)
      if (role.managed) {
        protectedRoles += 1;
        continue;
      }

      try {
        await sleep(BULK_SPACING_MS);
        await role.delete();
        logger.info(`Purged role: ${role.name}`);
      } catch (error) {
        failedRoles.push(role.name);
        logger.warn(`Failed to purge role ${role.name}: ${String(error)}`);
      }
    }

    const deletedChannels = channelsSnapshot.filter((c): c is NonNullable<typeof c> => c !== null).length - failedChannels.length;
    const deletedRoles = rolesSnapshot.length - protectedRoles - failedRoles.length;

    const embed = new EmbedBuilder()
      .setColor(failedChannels.length || failedRoles.length ? Colors.Yellow : Colors.Green)
      .setTitle('Server purge complete')
      .setDescription([
        `**Channels deleted:** ${deletedChannels}`,
        `**Roles deleted:** ${deletedRoles} (except @everyone / roles above the bot)`,
        failedChannels.length ? `**Could not delete channels:** ${failedChannels.join(', ')}` : '',
        failedRoles.length ? `**Could not delete roles:** ${failedRoles.join(', ')}` : '',
      ].join('\n'));

    // Send the results as a follow-up (the interaction was already acknowledged).
    // NOTE: every channel was just deleted, including the one the command ran
    // in — discord.js then throws Unknown Channel (10003) on followUp. Fall
    // back to a DM so the admin still gets the summary.
    try {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    } catch (error) {
      logger.warn(`delete-server: could not followUp (interaction channel was deleted): ${String(error)}`);
      try {
        await interaction.user.send({ embeds: [embed] });
      } catch (dmError) {
        logger.warn(`delete-server: could not DM the summary: ${String(dmError)}`);
      }
    }
  },
};

export default deleteServerCommand;