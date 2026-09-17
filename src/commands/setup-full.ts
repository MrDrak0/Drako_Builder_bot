import {
  ChannelType,
  ColorResolvable,
  Colors,
  EmbedBuilder,
  NonThreadGuildBasedChannel,
  OverwriteData,
  PermissionFlagsBits,
  Role,
  SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../handlers/commandLoader.js';
import { CATEGORY_SPECS, CHANNEL_AFK, ChannelOverwrite } from '../config/channelSpec.js';
import { EVERYONE_PERMISSIONS, MUTED_DENY_PERMISSIONS, ROLE_MUTED, ROLE_SPECS } from '../config/roleSpec.js';
import { logger } from '../utils/logger.js';
import { normalizeName, rateLimited, specNameSets } from '../utils/setupUtils.js';

/**
 * /setup-full — builds the SPEC server structure in one pass. Runs on a clean
 * guild only: if any spec-named role, category or channel already exists it
 * aborts immediately and tells the admin to run /delete-server first. This is
 * the safety net: creation is strictly sequential and idempotency comes from
 * "refuse to build on a dirty server" rather than fragile match-update logic,
 * which previously recreated duplicated channels.
 *
*  Stages:
 *  0. Guard — fetch roles + channels; abort if any spec item already exists.
 *  1. Roles — create the 8 roleSpec roles (no icon: the spec emoji is not a
 *     valid role-icon image and discord.js would read it as a file path),
 *     order them top-to-bottom (bottom-up position set).
 *  2. Channels — create every channelSpec category/channel with their explicit
 *     allow/deny overwrites folded into the create call (one API call per
 *     channel instead of one extra edit per overwrite). Wire the AFK channel.
 */

/** Human-readable error (DiscordAPIError code included when present). */
function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as { code?: string | number }).code;
    return code ? `${error.message} (${String(code)})` : error.message;
  }
  return String(error);
}

/** Converts spec overwrites into the Discord create-call payload (id + allow + deny),
 *  so each channel/category is created with its full permission set in ONE API call. */
function overwriteData(
  overwrites: ChannelOverwrite[] | undefined,
  roleIdByName: Map<string, string>,
  everyoneId: string,
  label: string,
): OverwriteData[] | undefined {
  if (!overwrites?.length) return undefined;
  const data: OverwriteData[] = [];
  for (const overwrite of overwrites) {
    const roleId = overwrite.roleName === '@everyone' ? everyoneId : roleIdByName.get(overwrite.roleName);
    if (!roleId) {
      logger.warn(`setup-full: role "${overwrite.roleName}" not found for ${label}; skipping`);
      continue;
    }
    data.push({ id: roleId, allow: overwrite.allow ?? [], deny: overwrite.deny ?? [] });
  }
  return data.length ? data : undefined;
}

const setupFullCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('setup-full')
    .setDescription('Builds the full spec server on a clean guild (refuses if any spec item exists)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute({ interaction }) {
    const guild = interaction.guild;
    if (!guild) return;

    await interaction.deferReply({ ephemeral: true });

    const created: string[] = [];
    const failed: { label: string; reason: string }[] = [];

    // ── Stage 0: pre-flight guard ──────────────────────────────────────────
    // Refuse to run if anything from the spec already exists. This makes
    // duplicates impossible: a re-run on a partly-built server stops here.
    const currentRoles = (await guild.roles.fetch()).filter((role) => !role.managed);
    const currentChannels = [...(await guild.channels.fetch()).values()].filter(
      (channel): channel is NonThreadGuildBasedChannel => channel !== null,
    );

    const { roles: specRoleNames, categories: specCategoryNames, channels: specChannelNames } = specNameSets();

    const existingRoles = [...currentRoles.values()].filter((role) => specRoleNames.has(normalizeName(role.name)));
    const existingCategories = currentChannels.filter(
      (channel) => channel.type === ChannelType.GuildCategory && specCategoryNames.has(normalizeName(channel.name)),
    );
    const existingChannels = currentChannels.filter(
      (channel) => channel.type !== ChannelType.GuildCategory && specChannelNames.has(normalizeName(channel.name)),
    );

    if (existingRoles.length || existingCategories.length || existingChannels.length) {
      const lines = [
        existingRoles.length ? `**Roles / الأدوار:** ${existingRoles.map((r) => r.name).join(', ')}` : '',
        existingCategories.length ? `**Categories / الفئات:** ${existingCategories.map((c) => c.name).join(', ')}` : '',
        existingChannels.length ? `**Channels / القنوات:** ${existingChannels.map((c) => c.name).join(', ')}` : '',
      ].filter(Boolean);

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Yellow)
            .setTitle('Server is not clean — setup aborted / الخادم ليس نظيفاً — تم الإلغاء')
            .setDescription(
              [
                'Nothing was created or changed. / لم يتم إنشاء أو تعديل أي شيء.',
                '',
                ...lines,
                '',
                'Run `/delete-server` first to reset the server, then run `/setup-full` again.',
                'قم بتشغيل `/delete-server` أولاً لإعادة تعيين السيرفر، ثم أعد تشغيل `/setup-full`.',
              ].join('\n'),
            ),
        ],
      });
      return;
    }

    // ── Stage 1: roles ─────────────────────────────────────────────────────
    // NOTE: `icon` is intentionally NOT sent to Discord. The spec stores emoji
    // (e.g. '👑'), but discord.js resolves a role-icon string as a FILE PATH, so
    // passing the emoji throws ENOENT during argument resolution — which is why
    // the earlier live test created zero roles. Role icons need real image data.
    const roleByName = new Map<string, Role>();
    for (const entry of ROLE_SPECS) {
      try {
        const role = await rateLimited(() =>
          guild.roles.create({
            name: entry.name,
            color: entry.color as ColorResolvable,
            hoist: entry.hoist,
            mentionable: entry.mentionable,
            permissions: entry.permissions,
          }),
        );
        roleByName.set(entry.name, role);
        created.push(`🎭 ${entry.name}`);
      } catch (error) {
        failed.push({ label: entry.name, reason: errorMessage(error) });
        logger.warn(`setup-full: role "${entry.name}" failed: ${String(error)}`);
      }
    }

    // Exact positions bottom-up (Muted just above @everyone → Owner on top).
    let position = 1;
    for (const entry of [...ROLE_SPECS].reverse()) {
      const role = roleByName.get(entry.name);
      if (!role) continue;
      try {
        await rateLimited(() => role.setPosition(position));
        position += 1;
      } catch (error) {
        failed.push({ label: `${entry.name} (position)`, reason: errorMessage(error) });
        logger.warn(`setup-full: position for "${entry.name}" failed: ${String(error)}`);
      }
    }

    const roleIdByName = new Map<string, string>();
    for (const [name, role] of roleByName) roleIdByName.set(name, role.id);
    const everyoneId = guild.roles.everyone.id;

    // @everyone reduced to the minimal set.
    try {
      await rateLimited(() => guild.roles.everyone.setPermissions(EVERYONE_PERMISSIONS));
    } catch (error) {
      failed.push({ label: '@everyone permissions', reason: errorMessage(error) });
      logger.warn(`setup-full: could not restrict @everyone: ${String(error)}`);
    }

    // ── Stage 2: channels + permission overwrites ──────────────────────────
    // Every overwrite is folded into the channel's create call (permissionOverwrites),
    // so building all 7 categories / 39 channels costs ~46 API calls instead of
    // ~46 channel creates + ~200 per-overwrite edits the old approach made.
    const mutedRole = roleByName.get(ROLE_MUTED);
    const mutedDeny = mutedRole ? [{ id: mutedRole.id, deny: MUTED_DENY_PERMISSIONS }] : [];

    for (const categorySpec of CATEGORY_SPECS) {
      try {
        const category = (await rateLimited(() =>
          guild.channels.create({
            name: categorySpec.name,
            type: ChannelType.GuildCategory,
            permissionOverwrites: overwriteData(categorySpec.overwrites, roleIdByName, everyoneId, `category ${categorySpec.name}`),
          }),
        )) as { id: string };
        created.push(`📁 ${categorySpec.name}`);

        for (const channelSpec of categorySpec.channels) {
          try {
            const isVoice = (channelSpec.kind ?? 'text') === 'voice';
            const channelOverwrites = [
              ...(overwriteData(channelSpec.overwrites, roleIdByName, everyoneId, `${categorySpec.name}/${channelSpec.name}`) ?? []),
              ...mutedDeny,
            ];
            await rateLimited(() =>
              guild.channels.create({
                name: channelSpec.name,
                type: isVoice ? ChannelType.GuildVoice : ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: channelOverwrites,
              }),
            );
            created.push(`#${channelSpec.name}`);
          } catch (error) {
            failed.push({ label: `#${channelSpec.name}`, reason: errorMessage(error) });
            logger.warn(`setup-full: ${categorySpec.name}/${channelSpec.name} failed: ${String(error)}`);
          }
        }
      } catch (error) {
        failed.push({ label: `📁 ${categorySpec.name}`, reason: errorMessage(error) });
        logger.warn(`setup-full: category ${categorySpec.name} failed: ${String(error)}`);
      }
    }

    // AFK voice channel (system setting, not just overwrites).
    const afkChannel = [...guild.channels.cache.values()].find(
      (channel) => (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice) && normalizeName(channel.name) === normalizeName(CHANNEL_AFK),
    );
    if (afkChannel) {
      try {
        await rateLimited(() => guild.setAFKChannel(afkChannel.id));
      } catch (error) {
        failed.push({ label: `AFK wiring (${CHANNEL_AFK})`, reason: errorMessage(error) });
        logger.warn(`setup-full: could not set AFK channel: ${String(error)}`);
      }
    }

    // ── Stage 3: result ────────────────────────────────────────────────────
    const color = failed.length ? Colors.Yellow : Colors.Green;
    const failedLines = failed.slice(0, 8).map((f) => `- \u2022 **${f.label}**: \`${f.reason.slice(0, 200)}\``);
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('Server setup complete / اكتمل إعداد السيرفر')
      .setDescription([
        `**Created / تم إنشاء:** ${created.length ? created.join(', ') : 'none / لا شيء'}`,
        failed.length ? `**Failed / فشل (${failed.length}):**\n${failedLines.join('\n')}` : 'All roles, channels and permission overwrites are in place per the spec. / كل الأدوار والقنوات والأذونات جاهزة حسب المواصفات.',
        failed.length > failedLines.length ? `\n...and ${failed.length - failedLines.length} more failure(s) — see the logs.` : '',
      ].join('\n'));

    await interaction.editReply({ embeds: [embed] });
  },
};

export default setupFullCommand;