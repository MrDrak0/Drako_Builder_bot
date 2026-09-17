/**
 * Minimal leveled console logger with timestamps.
 * Console only — nothing is persisted.
 */
const LEVEL_BADGE = {
    debug: 'DEBUG',
    info: 'INFO ',
    warn: 'WARN ',
    error: 'ERROR',
};
function write(level, message) {
    const time = new Date().toISOString();
    const line = `[${time}] [${LEVEL_BADGE[level]}] ${message}`;
    if (level === 'error')
        console.error(line);
    else if (level === 'warn')
        console.warn(line);
    else
        console.log(line);
}
export const logger = {
    debug: (msg) => write('debug', msg),
    info: (msg) => write('info', msg),
    warn: (msg) => write('warn', msg),
    error: (msg) => write('error', msg),
};
