import { DiscordAPIError } from 'discord.js';
import { logger } from './logger.js';

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Inter-call delay for bulk guild writes. Small enough that /setup-full builds
 * the whole spec quickly (~65 API calls once overwrites are folded into
 * creation); any 429 bursts are additionally absorbed by withRetry().
 */
export const BULK_SPACING_MS = 150;

/**
 * Retries an API call on HTTP 429, honouring the retry_after hint from Discord.
 * Bulk role/channel creation must never die mid-setup on a rate limit — a
 * half-built server without a report is unacceptable.
 */
export async function withRetry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimit = error instanceof DiscordAPIError && error.status === 429;
      if (!isRateLimit || attempt >= attempts) throw error;

      const rateLimited = (error as DiscordAPIError & { rateLimited?: { retryAfter?: number } }).rateLimited;
      const waitMs = rateLimited?.retryAfter ? rateLimited.retryAfter * 1000 : 1000;
      logger.warn(`Rate limited; retrying in ${waitMs}ms (attempt ${attempt}/${attempts})`);
      await sleep(waitMs);
    }
  }
}