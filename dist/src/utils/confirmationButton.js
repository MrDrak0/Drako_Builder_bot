import { randomUUID } from 'node:crypto';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, } from 'discord.js';
import { logger } from './logger.js';
const pending = new Map();
export async function requestConfirmation(interaction, options) {
    const id = randomUUID();
    const confirmId = `confirm_${id}_yes`;
    const cancelId = `confirm_${id}_no`;
    const embed = new EmbedBuilder()
        .setColor(Colors.Yellow)
        .setTitle(options.title)
        .setDescription(options.description);
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(confirmId).setLabel(options.confirmLabel ?? 'Confirm').setStyle(ButtonStyle.Danger), new ButtonBuilder().setCustomId(cancelId).setLabel(options.cancelLabel ?? 'Cancel').setStyle(ButtonStyle.Secondary));
    // Must be awaited here so any reply failure surfaces to the command's
    // try/catch instead of leaving the interaction hanging with no response.
    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            pending.delete(id);
            resolve(false);
        }, 60_000);
        pending.set(id, { resolve, timer });
    });
}
/** Resolves a pending confirmation from a button click. Returns false if the click wasn't ours. */
export async function handleConfirmationButton(interaction) {
    const match = /^confirm_([\w-]+)_(yes|no)$/.exec(interaction.customId);
    if (!match)
        return false;
    const state = pending.get(match[1]);
    const confirmed = match[2] === 'yes';
    if (!state) {
        await interaction.reply({ content: 'This confirmation has expired or was already answered.', ephemeral: true });
        return true;
    }
    clearTimeout(state.timer);
    pending.delete(match[1]);
    state.resolve(confirmed);
    // Reflect the choice and disable the buttons so nothing can be clicked twice.
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(match[1]).setLabel(confirmed ? 'Confirmed' : 'Cancelled').setStyle(ButtonStyle.Secondary).setDisabled(true));
    try {
        await interaction.update({ components: [row] });
    }
    catch (error) {
        logger.warn(`Could not finalize confirmation message: ${String(error)}`);
    }
    return true;
}
