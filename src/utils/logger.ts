/**
 * Minimal leveled console logger with timestamps.
 * Console only — nothing is persisted.
 */
const LEVEL_BADGE: Record<string, string> = {
  debug: 'DEBUG',
  info: 'INFO ',
  warn: 'WARN ',
  error: 'ERROR',
};

function write(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
  const time = new Date().toISOString();
  const line = `[${time}] [${LEVEL_BADGE[level]}] ${message}`;
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (msg: string) => write('debug', msg),
  info: (msg: string) => write('info', msg),
  warn: (msg: string) => write('warn', msg),
  error: (msg: string) => write('error', msg),
};