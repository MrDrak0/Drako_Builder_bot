/**
 * roleSpec.ts — the single source of truth for the role hierarchy.
 *
 * Position order in this array = position order in Discord (top = highest).
 * /setup-full creates these 8 roles on a clean guild in this exact order.
 */

import { PermissionFlagsBits, PermissionResolvable } from 'discord.js';

interface RoleSpecEntry {
  name: string;
  color: string;
  hoist: boolean;
  mentionable: boolean;
  icon: string;
  permissions: PermissionResolvable[];
}

/** Roles created by /setup-full, in exact top-to-bottom order. */
export const ROLE_SPECS: RoleSpecEntry[] = [
  {
    name: 'Owner',
    color: '#992D22',
    hoist: true,
    mentionable: false,
    icon: '👑',
    permissions: [PermissionFlagsBits.Administrator],
  },
  {
    name: 'Management',
    color: '#E67E22',
    hoist: true,
    mentionable: true,
    icon: '🛡️',
    permissions: [
      PermissionFlagsBits.ManageGuild,
      PermissionFlagsBits.ManageRoles,
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.ManageWebhooks,
      PermissionFlagsBits.ManageEvents,
      PermissionFlagsBits.ManageGuildExpressions,
      PermissionFlagsBits.ViewAuditLog,
      PermissionFlagsBits.KickMembers,
      PermissionFlagsBits.BanMembers,
      PermissionFlagsBits.ManageNicknames,
      PermissionFlagsBits.ModerateMembers,
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.ManageThreads,
    ],
  },
  {
    name: 'Moderators',
    color: '#F1C40F',
    hoist: true,
    mentionable: true,
    icon: '🔨',
    permissions: [
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.ManageThreads,
      PermissionFlagsBits.KickMembers,
      PermissionFlagsBits.ModerateMembers,
      PermissionFlagsBits.MuteMembers,
      PermissionFlagsBits.DeafenMembers,
      PermissionFlagsBits.MoveMembers,
      PermissionFlagsBits.ViewAuditLog,
      PermissionFlagsBits.ManageNicknames,
    ],
  },
  {
    name: 'VIP',
    color: '#9B59B6',
    hoist: true,
    mentionable: false,
    icon: '💎',
    permissions: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.EmbedLinks,
      PermissionFlagsBits.AttachFiles,
      PermissionFlagsBits.UseExternalEmojis,
      PermissionFlagsBits.UseExternalStickers,
      PermissionFlagsBits.PrioritySpeaker,
      PermissionFlagsBits.Stream,
      PermissionFlagsBits.SendVoiceMessages,
    ],
  },
  {
    name: 'Trusted Members',
    color: '#3498DB',
    hoist: false,
    mentionable: false,
    icon: '⭐',
    permissions: [
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.EmbedLinks,
      PermissionFlagsBits.AttachFiles,
      PermissionFlagsBits.AddReactions,
      PermissionFlagsBits.CreatePublicThreads,
      PermissionFlagsBits.Stream,
      PermissionFlagsBits.UseSoundboard,
      PermissionFlagsBits.Connect,
      PermissionFlagsBits.Speak,
    ],
  },
  {
    name: 'Members',
    color: '#2ECC71',
    hoist: false,
    mentionable: false,
    icon: '👥',
    permissions: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.AddReactions,
      PermissionFlagsBits.Connect,
      PermissionFlagsBits.Speak,
      PermissionFlagsBits.UseVAD,
    ],
  },
  {
    name: 'Bots',
    color: '#95A5A6',
    hoist: true,
    mentionable: false,
    icon: '🤖',
    permissions: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.EmbedLinks,
    ],
  },
  {
    name: 'Muted',
    color: '#5C6370',
    hoist: false,
    mentionable: false,
    icon: '🔇',
    permissions: [],
  },
];

/** @everyone's reduced permission set per the spec (only these three). */
export const EVERYONE_PERMISSIONS: PermissionResolvable[] = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.Connect,
];

/** Denies applied to every text/voice channel for the Muted role. */
export const MUTED_DENY_PERMISSIONS: PermissionResolvable[] = [
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.AddReactions,
  PermissionFlagsBits.Speak,
  PermissionFlagsBits.CreatePublicThreads,
  PermissionFlagsBits.CreatePrivateThreads,
];

/** VIP-exclusive channel that gets a ViewChannel overwrite for the VIP role. */
export const VIP_EXCLUSIVE_CHANNEL = '⭐ VIP Voice';

export const ROLE_MUTED = 'Muted';