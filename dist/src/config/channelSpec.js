/**
 * channelSpec.ts — the single source of truth for /setup-full.
 *
 * Full category + channel structure with EXACT permission overwrites per the
 * owner's spec. Uses the role hierarchy from roleSpec.ts (Owner, Management,
 * Moderators, VIP, Trusted Members, Members, Bots, Muted, @everyone).
 *
 * Conventions:
 *  - Legend: ✅ = allow, ❌ = deny, inherit = no explicit overwrite here.
 *  - Owner/Management are NOT repeated per-channel: they reach everything via
 *    their base permissions (Administrator / broad Manage perms). Only roles
 *    that need a specific overwrite are written.
 *  - Parent categories are created first with their baseline overwrites, which
 *    cascade to children; every channel ALSO gets its own explicit overwrites.
 */
import { PermissionFlagsBits } from 'discord.js';
/** Shorthand builders so the tables below read cleanly. */
const allow = (roleName, ...permissions) => ({ roleName, allow: permissions });
const deny = (roleName, ...permissions) => ({ roleName, deny: permissions });
/** Channel names the build reads back afterwards (AFK wiring, logs channel). */
export const CHANNEL_AFK = '😴 AFK';
const CHANNEL_LOGS = '📂 logs';
export const CATEGORY_SPECS = [
    // ── 🏠 WELCOME ──────────────────────────────────────────────────────────
    {
        name: '🏠 WELCOME',
        overwrites: [
            allow('@everyone', PermissionFlagsBits.ViewChannel),
            deny('@everyone', PermissionFlagsBits.SendMessages),
            allow('Members', PermissionFlagsBits.ViewChannel),
            deny('Members', PermissionFlagsBits.SendMessages),
            allow('Moderators', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages),
        ],
        channels: [
            {
                name: '📜 rules',
                overwrites: [
                    allow('@everyone', PermissionFlagsBits.ViewChannel),
                    deny('@everyone', PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions),
                    allow('Members', PermissionFlagsBits.ViewChannel),
                    deny('Members', PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions),
                    allow('Moderators', PermissionFlagsBits.SendMessages),
                ],
            },
            {
                name: '👋 welcome',
                overwrites: [
                    allow('@everyone', PermissionFlagsBits.ViewChannel),
                    deny('@everyone', PermissionFlagsBits.SendMessages),
                    allow('Members', PermissionFlagsBits.ViewChannel),
                    deny('Members', PermissionFlagsBits.SendMessages),
                    allow('Moderators', PermissionFlagsBits.SendMessages),
                ],
            },
            {
                name: '📢 announcements',
                overwrites: [
                    allow('@everyone', PermissionFlagsBits.ViewChannel),
                    deny('@everyone', PermissionFlagsBits.SendMessages),
                    allow('Members', PermissionFlagsBits.ViewChannel),
                    deny('Members', PermissionFlagsBits.SendMessages),
                    allow('Moderators', PermissionFlagsBits.SendMessages),
                ],
            },
            {
                name: '📅 stream-schedule',
                overwrites: [
                    allow('@everyone', PermissionFlagsBits.ViewChannel),
                    deny('@everyone', PermissionFlagsBits.SendMessages),
                    allow('Members', PermissionFlagsBits.ViewChannel),
                    deny('Members', PermissionFlagsBits.SendMessages),
                    allow('Moderators', PermissionFlagsBits.SendMessages),
                ],
            },
            {
                name: '🔴 live-notifications',
                overwrites: [
                    allow('@everyone', PermissionFlagsBits.ViewChannel),
                    deny('@everyone', PermissionFlagsBits.SendMessages),
                    allow('Members', PermissionFlagsBits.ViewChannel),
                    deny('Members', PermissionFlagsBits.SendMessages),
                    allow('Moderators', PermissionFlagsBits.SendMessages),
                ],
            },
            {
                name: '🎭 self-roles',
                overwrites: [
                    allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.AddReactions),
                    deny('@everyone', PermissionFlagsBits.SendMessages),
                    allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.AddReactions),
                    deny('Members', PermissionFlagsBits.SendMessages),
                    allow('Moderators', PermissionFlagsBits.SendMessages),
                ],
            },
        ],
    },
    // ── 🎥 STREAM ───────────────────────────────────────────────────────────
    {
        name: '🎥 STREAM',
        overwrites: [
            allow('@everyone', PermissionFlagsBits.ViewChannel),
            deny('@everyone', PermissionFlagsBits.SendMessages),
            allow('Members', PermissionFlagsBits.ViewChannel),
            deny('Members', PermissionFlagsBits.SendMessages),
        ],
        channels: [
            {
                name: '🎬 clips',
                overwrites: [
                    allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks),
                    allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks),
                    allow('Trusted Members', PermissionFlagsBits.SendMessages),
                    allow('VIP', PermissionFlagsBits.SendMessages),
                    allow('Moderators', PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages),
                ],
            },
            {
                name: '📸 screenshots',
                overwrites: [
                    allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles),
                    allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles),
                    allow('Trusted Members', PermissionFlagsBits.SendMessages),
                    allow('VIP', PermissionFlagsBits.SendMessages),
                    allow('Moderators', PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages),
                ],
            },
            {
                name: '🎥 youtube',
                overwrites: [
                    allow('@everyone', PermissionFlagsBits.ViewChannel),
                    deny('@everyone', PermissionFlagsBits.SendMessages),
                    allow('Members', PermissionFlagsBits.ViewChannel),
                    deny('Members', PermissionFlagsBits.SendMessages),
                    allow('Moderators', PermissionFlagsBits.SendMessages),
                ],
            },
            {
                name: '💜 twitch',
                overwrites: [
                    allow('@everyone', PermissionFlagsBits.ViewChannel),
                    deny('@everyone', PermissionFlagsBits.SendMessages),
                    allow('Members', PermissionFlagsBits.ViewChannel),
                    deny('Members', PermissionFlagsBits.SendMessages),
                    allow('Moderators', PermissionFlagsBits.SendMessages),
                ],
            },
            {
                name: '🟢 kick',
                overwrites: [
                    allow('@everyone', PermissionFlagsBits.ViewChannel),
                    deny('@everyone', PermissionFlagsBits.SendMessages),
                    allow('Members', PermissionFlagsBits.ViewChannel),
                    deny('Members', PermissionFlagsBits.SendMessages),
                    allow('Moderators', PermissionFlagsBits.SendMessages),
                ],
            },
            {
                name: '🎵 tiktok',
                overwrites: [
                    allow('@everyone', PermissionFlagsBits.ViewChannel),
                    deny('@everyone', PermissionFlagsBits.SendMessages),
                    allow('Members', PermissionFlagsBits.ViewChannel),
                    deny('Members', PermissionFlagsBits.SendMessages),
                    allow('Moderators', PermissionFlagsBits.SendMessages),
                ],
            },
        ],
    },
    // ── 💬 COMMUNITY ────────────────────────────────────────────────────────
    {
        name: '💬 COMMUNITY',
        overwrites: [
            allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks),
            allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks),
        ],
        channels: [
            { name: '💬 general', overwrites: [allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages), allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages)] },
            { name: '😂 memes', overwrites: [allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles), allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles)] },
            { name: '📷 media', overwrites: [allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles), allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles)] },
            { name: '🎵 music', overwrites: [allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks), allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks)] },
            { name: '🍕 food', overwrites: [allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles), allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles)] },
            { name: '🐱 pets', overwrites: [allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles), allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles)] },
        ],
    },
    // ── 🎮 GAMING ───────────────────────────────────────────────────────────
    {
        name: '🎮 GAMING',
        overwrites: [
            allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.AttachFiles),
            allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.AttachFiles),
        ],
        channels: [
            { name: '💀 dead-by-daylight', overwrites: [allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages), allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages)] },
            { name: '🚗 gta', overwrites: [allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages), allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages)] },
            { name: '🔫 fps-games', overwrites: [allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages), allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages)] },
            { name: '🎮 other-games', overwrites: [allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages), allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages)] },
            {
                name: '👥 looking-for-group',
                overwrites: [
                    allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages),
                    deny('@everyone', PermissionFlagsBits.MentionEveryone),
                    allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages),
                    deny('Members', PermissionFlagsBits.MentionEveryone),
                ],
            },
            { name: '🏆 highlights', overwrites: [allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles), allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles)] },
        ],
    },
    // ── 🎙️ VOICE ───────────────────────────────────────────────────────────
    {
        name: '🎙️ VOICE',
        overwrites: [
            allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.UseVAD, PermissionFlagsBits.Stream),
            allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.UseVAD, PermissionFlagsBits.Stream),
        ],
        channels: [
            { name: '🎤 General 1', kind: 'voice', overwrites: [allow('@everyone', PermissionFlagsBits.Connect), allow('Members', PermissionFlagsBits.Connect)] },
            { name: '🎤 General 2', kind: 'voice', overwrites: [allow('@everyone', PermissionFlagsBits.Connect), allow('Members', PermissionFlagsBits.Connect)] },
            { name: '🎮 Gaming 1', kind: 'voice', overwrites: [allow('@everyone', PermissionFlagsBits.Connect), allow('Members', PermissionFlagsBits.Connect)] },
            { name: '🎮 Gaming 2', kind: 'voice', overwrites: [allow('@everyone', PermissionFlagsBits.Connect), allow('Members', PermissionFlagsBits.Connect)] },
            { name: '💀 Dead by Daylight', kind: 'voice', overwrites: [allow('@everyone', PermissionFlagsBits.Connect), allow('Members', PermissionFlagsBits.Connect)] },
            {
                name: '⭐ VIP Voice',
                kind: 'voice',
                // Visible to everyone (aspirational) but only VIP and above can join.
                overwrites: [
                    allow('@everyone', PermissionFlagsBits.ViewChannel),
                    deny('@everyone', PermissionFlagsBits.Connect),
                    allow('Members', PermissionFlagsBits.ViewChannel),
                    deny('Members', PermissionFlagsBits.Connect),
                    allow('VIP', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.PrioritySpeaker),
                    allow('Moderators', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak),
                    allow('Management', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak),
                    allow('Owner', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak),
                ],
            },
            {
                name: CHANNEL_AFK,
                kind: 'voice',
                overwrites: [allow('@everyone', PermissionFlagsBits.Connect), deny('@everyone', PermissionFlagsBits.Speak), allow('Members', PermissionFlagsBits.Connect), deny('Members', PermissionFlagsBits.Speak)],
            },
        ],
    },
    // ── 🎫 SUPPORT ──────────────────────────────────────────────────────────
    {
        name: '🎫 SUPPORT',
        overwrites: [
            allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages),
            allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages),
        ],
        channels: [
            {
                name: '🎫 create-ticket',
                overwrites: [
                    allow('@everyone', PermissionFlagsBits.ViewChannel),
                    deny('@everyone', PermissionFlagsBits.SendMessages),
                    allow('Members', PermissionFlagsBits.ViewChannel),
                    deny('Members', PermissionFlagsBits.SendMessages),
                    allow('Moderators', PermissionFlagsBits.SendMessages),
                ],
            },
            {
                name: '❓ faq',
                overwrites: [
                    allow('@everyone', PermissionFlagsBits.ViewChannel),
                    deny('@everyone', PermissionFlagsBits.SendMessages),
                    allow('Members', PermissionFlagsBits.ViewChannel),
                    deny('Members', PermissionFlagsBits.SendMessages),
                    allow('Moderators', PermissionFlagsBits.SendMessages),
                ],
            },
            {
                name: '💡 suggestions',
                overwrites: [
                    allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions),
                    allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions),
                    allow('Moderators', PermissionFlagsBits.ManageMessages),
                ],
            },
            {
                name: '🚨 report',
                overwrites: [
                    allow('@everyone', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages),
                    allow('Members', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages),
                    allow('Moderators', PermissionFlagsBits.ManageMessages),
                ],
            },
        ],
    },
    // ── 👑 STAFF ────────────────────────────────────────────────────────────
    {
        name: '👑 STAFF',
        overwrites: [
            deny('@everyone', PermissionFlagsBits.ViewChannel),
            deny('Members', PermissionFlagsBits.ViewChannel),
            deny('Trusted Members', PermissionFlagsBits.ViewChannel),
            deny('VIP', PermissionFlagsBits.ViewChannel),
            allow('Moderators', PermissionFlagsBits.ViewChannel),
            allow('Management', PermissionFlagsBits.ViewChannel),
            allow('Owner', PermissionFlagsBits.ViewChannel),
        ],
        channels: [
            {
                name: '📝 staff-chat',
                overwrites: [
                    allow('Moderators', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages),
                    deny('Bots', PermissionFlagsBits.ViewChannel),
                ],
            },
            {
                name: CHANNEL_LOGS,
                // Staff read-only; the Bot role can view and post here.
                overwrites: [
                    allow('Moderators', PermissionFlagsBits.ViewChannel),
                    deny('Moderators', PermissionFlagsBits.SendMessages),
                    allow('Bots', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages),
                ],
            },
            {
                name: '🤖 bot-commands',
                overwrites: [
                    allow('Moderators', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages),
                    allow('Bots', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages),
                ],
            },
            {
                name: '⚠️ reports',
                overwrites: [
                    allow('Moderators', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages),
                    allow('Bots', PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages),
                ],
            },
        ],
    },
];
