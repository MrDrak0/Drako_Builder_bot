import { SlashCommandBuilder } from 'discord.js';
const pingCommand = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with the bot\u2019s latency'),
    async execute({ interaction }) {
        await interaction.reply({
            content: `Pong! Websocket heartbeat: ${interaction.client.ws.ping}ms`,
        });
    },
};
export default pingCommand;
