import { PermissionFlagsBits, PermissionOverwriteOptions, PermissionResolvable, PermissionsBitField } from 'discord.js';
import { BULK_SPACING_MS, sleep, withRetry } from './rateLimit.js';
import { CATEGORY_SPECS } from '../config/channelSpec.js';
import { ROLE_SPECS } from '../config/roleSpec.js';

/**
 * Shared utilities for the spec server builder (src/commands/setup-full.ts)
 * and the server inspector (src/commands/scan-server.ts).
 */

/** Small delay + retry wrapper to stay within Discord's rate limits. */
export async function rateLimited<T>(fn: () => Promise<T>): Promise<T> {
  await sleep(BULK_SPACING_MS);
  return withRetry(fn);
}

/** Bit value → permission name (permits indexing PermissionOverwriteOptions by name). */
const permissionNamesByBit = new Map(
  Object.entries(PermissionFlagsBits).map(([name, bit]) => [String(bit), name]),
);

function permissionKey(permission: PermissionResolvable): keyof PermissionOverwriteOptions | undefined {
  const bit = new PermissionsBitField(permission).bitfield.toString();
  return permissionNamesByBit.get(bit) as keyof PermissionOverwriteOptions | undefined;
}

/** Decomposes a named emoji into a canonical text sequence so channel names
 *  round-trip through Discord identically (Discord can add/remove U+FE0F
 *  variation selectors when storing a name).
 *
 *  Also mirrors Discord's automatic name normalization for text channels:
 *  spaces are converted to hyphens (e.g. the spec's "📜 rules" is stored by
 *  Discord as "📜-rules"). The transform is applied to BOTH the spec name and
 *  the Discord-side name, so categories and voice channels — whose spaces
 *  Discord keeps — still compare equal after normalization. */
export function normalizeName(name: string): string {
  return name
    .replace(/[\uFE0F]/gu, '') // variation selector-16 (text vs emoji presentation)
    .replace(/\s+/gu, '-') // text channels: Discord stores spaces as hyphens
    .normalize('NFC');
}

/** Normalized spec name sets for comparing guild state against the specs.
 *  Shared by /setup-full's Stage-0 guard and /scan's issue checks. */
export function specNameSets(): { roles: Set<string>; categories: Set<string>; channels: Set<string> } {
  return {
    roles: new Set(ROLE_SPECS.map((r) => normalizeName(r.name))),
    categories: new Set(CATEGORY_SPECS.map((c) => normalizeName(c.name))),
    channels: new Set(CATEGORY_SPECS.flatMap((c) => c.channels.map((ch) => normalizeName(ch.name)))),
  };
}

/** Converts allow/deny permission lists to the permission-keyed overwrite payload (true=allow, false=deny). */
export function toOverwritePayload(overwrite: { allow?: PermissionResolvable[]; deny?: PermissionResolvable[] }): PermissionOverwriteOptions {
  const payload: PermissionOverwriteOptions = {};
  for (const permission of overwrite.allow ?? []) {
    const key = permissionKey(permission);
    if (key) payload[key] = true;
  }
  for (const permission of overwrite.deny ?? []) {
    const key = permissionKey(permission);
    if (key) payload[key] = false;
  }
  return payload;
}