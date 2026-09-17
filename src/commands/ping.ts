import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../handlers/commandLoader.js';

const pingCommand: Command = {
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