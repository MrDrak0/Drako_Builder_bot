import { ChannelType, Colors, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { normalizeName, specNameSets } from '../utils/setupUtils.js';
const FIELD_VALUE_LIMIT = 1024;
const FIELD_NOTE = (n) => `\n…and ${n} more — full list in the file`;
/**
 * Fits a list of lines into an embed field value (hard Discord limit: 1024
 * chars). Keeps WHOLE lines only — never cuts mid-word — and appends an
 * "…and N more" note when something had to be dropped.
 */
function fitField(lines) {
    if (lines.length === 0)
        return { value: '(none)', truncated: false };
    let value = '';
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const candidate = value ? `${value}\n${line}` : line;
        const remaining = lines.length - i - 1;
        const noteLen = remaining > 0 ? FIELD_NOTE(remaining).length : 0;
        if (candidate.length + noteLen > FIELD_VALUE_LIMIT)
            break;
        value = candidate;
        if (remaining === 0)
            return { value, truncated: false };
    }
    const remaining = lines.length - value.split('\n').length;
    return { value: `${value}${FIELD_NOTE(remaining)}`, truncated: true };
}
/**
 * /scan — inspects the CURRENT state of the server (not the setup state) and
 * reports everything that actually exists: categories, channels (with their
 * permission overwrites), roles (with their permissions), and any issues found
 * (uncategorized channels, conflicting overwrites, orphaned/unreferenced
 * roles). Non-destructive, read-only.
 */
const scanServerCommand = {
    data: new SlashCommandBuilder()
        .setName('scan')
        .setDescription('Inspects this server and lists its categories, channels, roles, permissions and issues')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute({ interaction }) {
        const guild = interaction.guild;
        if (!guild)
            return;
        await interaction.deferReply({ ephemeral: true });
        const roleById = new Map();
        const roles = [...(await guild.roles.fetch()).values()].sort((a, b) => b.position - a.position);
        for (const role of roles)
            roleById.set(role.id, role);
        const rawChannels = [...(await guild.channels.fetch()).values()].filter((channel) => channel !== null);
        const channels = rawChannels
            .map((channel) => ({
            id: channel.id,
            name: channel.name,
            type: channel.type,
            parentId: channel.parentId,
            position: channel.position ?? 0,
            voice: channel.isVoiceBased(),
            overwrites: overwriteInfo(channel, roleById),
        }))
            .sort((a, b) => a.position - b.position);
        const categories = channels.filter((c) => c.type === ChannelType.GuildCategory);
        const texts = channels.filter((c) => c.type !== ChannelType.GuildCategory && !c.voice);
        const voices = channels.filter((c) => c.voice);
        const uncategorized = channels.filter((c) => c.type !== ChannelType.GuildCategory && c.parentId === null);
        const issues = collectIssues(channels, roleById, guild);
        // ── Fields: issues, one per category, uncategorized, overwrites, roles ──
        const fields = [];
        let needsFile = false;
        if (issues.length > 0) {
            const { value, truncated } = fitField(issues);
            if (truncated)
                needsFile = true;
            fields.push({ name: `\u26A0 Issues found (${issues.length})`, value });
        }
        for (const category of categories) {
            const children = channels.filter((c) => c.parentId === category.id);
            const lines = children.map((c) => `${c.voice ? '\u{1F508}' : '#'} ${c.name}`);
            const { value, truncated } = fitField(lines);
            if (truncated)
                needsFile = true;
            fields.push({ name: `\u{1F4C2} ${category.name} (${children.length})`, value: value === '(none)' ? '(empty)' : value });
        }
        if (uncategorized.length > 0) {
            const lines = uncategorized.map((c) => `${c.voice ? '\u{1F508}' : '#'} ${c.name}`);
            const { value, truncated } = fitField(lines);
            if (truncated)
                needsFile = true;
            fields.push({ name: `\u{1F4C1} Uncategorized (${lines.length})`, value });
        }
        const overwriteLines = channelsWithOverwrites(channels);
        if (overwriteLines.length > 0) {
            const { value, truncated } = fitField(overwriteLines);
            if (truncated)
                needsFile = true;
            fields.push({ name: `\u{1F512} Overwrites (${overwriteLines.length} channels)`, value });
        }
        {
            const lines = roles.map(roleLine);
            const { value, truncated } = fitField(lines);
            if (truncated)
                needsFile = true;
            fields.push({ name: `Roles (${roles.length})`, value });
        }
        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`Server scan — ${guild.name}`)
            .setDescription([
            `**Categories:** ${categories.length}`,
            `**Text channels:** ${texts.length}`,
            `**Voice channels:** ${voices.length}`,
            `**Roles:** ${roles.length}`,
            issues.length > 0 ? `**Issues:** ${issues.length}` : '**Issues:** none',
        ].join('\n'))
            .addFields(fields);
        if (needsFile || embed.length > 6000) {
            const dump = dumpPlain(channels, categories, roles, issues);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Blue)
                        .setTitle(`Server scan — ${guild.name}`)
                        .setDescription([
                        `**Categories:** ${categories.length} · **Text:** ${texts.length} · **Voice:** ${voices.length} · **Roles:** ${roles.length}`,
                        issues.length > 0 ? `**Issues:** ${issues.length}` : '**Issues:** none',
                        '',
                        'Full listing (channels, overwrites, permissions, issues) exported as a file.',
                    ].join('\n')),
                ],
                files: [{ attachment: Buffer.from(dump, 'utf-8'), name: 'server-scan.txt' }],
            });
            return;
        }
        await interaction.editReply({ embeds: [embed] });
    },
};
function overwriteInfo(channel, roleById) {
    return channel.permissionOverwrites.cache.map((overwrite) => {
        const isRole = overwrite.type === 0;
        const role = isRole ? roleById.get(overwrite.id) : undefined;
        return {
            target: isRole
                ? role?.name ?? `role:${overwrite.id}`
                : channel.guild.members.cache.get(overwrite.id)?.user.tag ?? `member:${overwrite.id}`,
            kind: isRole ? 'role' : 'member',
            id: overwrite.id,
            allow: overwrite.allow.toArray(),
            deny: overwrite.deny.toArray(),
        };
    });
}
/**
 * Flags real inconsistencies against the ROLE_SPECS / CATEGORY_SPECS; never
 * tries to "fix" anything.
 *  - uncategorized channels
 *  - missing or extra categories/channels compared with the channel spec
 *  - role overwrites whose role no longer exists
 *  - orphaned roles (0 members) or roles not present in the role spec
 *
 * NOTE: a channel that DENIES a permission a role holds server-wide is NOT an
 * issue — the channel spec deliberately does this (e.g. @everyone has
 * SendMessages server-wide but WELCOME channels deny it so only staff can post).
 * That is the intended "read-only channel" pattern, not a conflict.
 */
function collectIssues(channels, roleById, guild) {
    const issues = [];
    const { roles: specRoleNames, categories: specCategoryNames, channels: specChannelNames } = specNameSets();
    const categoryNames = new Set(channels.filter((c) => c.type === ChannelType.GuildCategory).map((c) => normalizeName(c.name)));
    const presentChannelNames = new Set(channels.filter((c) => c.type !== ChannelType.GuildCategory).map((c) => normalizeName(c.name)));
    for (const channel of channels) {
        if (channel.type === ChannelType.GuildCategory) {
            if (!specCategoryNames.has(normalizeName(channel.name))) {
                issues.push(`Category "${channel.name}" is not part of the channel spec`);
            }
        }
        else if (!specChannelNames.has(normalizeName(channel.name))) {
            issues.push(`#${channel.name} is not referenced in the channel spec`);
        }
    }
    for (const name of specCategoryNames) {
        if (!categoryNames.has(name))
            issues.push(`Missing category: ${name}`);
    }
    for (const name of specChannelNames) {
        if (!presentChannelNames.has(name))
            issues.push(`Missing channel: ${name}`);
    }
    for (const channel of channels) {
        if (channel.type !== ChannelType.GuildCategory && channel.parentId === null) {
            issues.push(`#${channel.name} has no category (uncategorized)`);
        }
        for (const overwrite of channel.overwrites) {
            if (overwrite.kind !== 'role')
                continue;
            if (!roleById.has(overwrite.id)) {
                issues.push(`#${channel.name} has an overwrite for a role that no longer exists (${overwrite.id})`);
            }
        }
    }
    for (const role of roleById.values()) {
        if (role.id === guild.roles.everyone.id || role.managed)
            continue;
        if (!specRoleNames.has(normalizeName(role.name))) {
            issues.push(`Role "${role.name}" is not part of the role spec (extra role)`);
        }
    }
    return issues;
}
function channelsWithOverwrites(channels) {
    const lines = [];
    for (const channel of channels) {
        if (channel.overwrites.length === 0)
            continue;
        const parts = channel.overwrites.map((o) => {
            const allow = o.allow.length ? `+${o.allow.join('/')}` : '';
            const deny = o.deny.length ? `-${o.deny.join('/')}` : '';
            return `${o.target} ${[allow, deny].filter(Boolean).join(' ')}`.trim();
        });
        lines.push(`#${channel.name}: ${parts.join('; ')}`);
    }
    return lines;
}
function roleLine(role) {
    const members = role.guild.members.cache.filter((m) => m.roles.cache.has(role.id)).size;
    const color = role.hexColor === '#000000' ? 'default' : role.hexColor;
    const extra = role.managed ? ' (managed)' : role.mentionable ? ' (mentionable)' : '';
    const perms = role.permissions.toArray();
    const permsText = perms.includes('Administrator') ? 'Administrator (full access)' : perms.length ? perms.join(', ') : 'no special permissions';
    return `${role.name} — ${color} — ${members} member(s)${extra}\n  \u2514 ${permsText}`;
}
function dumpPlain(channels, categories, roles, issues) {
    const out = [];
    for (const category of categories) {
        out.push(`== ${category.name} ==`);
        for (const child of channels.filter((c) => c.parentId === category.id)) {
            out.push(`  ${child.voice ? '(voice)' : '(text)'}  ${child.name}  [${child.id}]`);
            for (const overwrite of child.overwrites) {
                const flags = [];
                if (overwrite.allow.length)
                    flags.push(`allow(${overwrite.allow.join(', ')})`);
                if (overwrite.deny.length)
                    flags.push(`deny(${overwrite.deny.join(', ')})`);
                out.push(`    overwrite ${overwrite.target}: ${flags.join(' ') || '(none)'}`);
            }
        }
    }
    const uncategorized = channels.filter((c) => c.type !== ChannelType.GuildCategory && c.parentId === null);
    if (uncategorized.length) {
        out.push('== Uncategorized ==');
        for (const channel of uncategorized)
            out.push(`  ${channel.name}  [${channel.id}]`);
    }
    out.push('== Roles ==');
    for (const role of roles) {
        out.push(`  ${role.name}  [${role.id}]  ${role.hexColor}  perms(${role.permissions.toArray().join(', ') || 'none'})`);
    }
    out.push('== Issues ==');
    for (const issue of issues)
        out.push(`  - ${issue}`);
    return out.join('\n');
}
export default scanServerCommand;
