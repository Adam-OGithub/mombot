'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { deferReply, editReply } = require('../custom_node_modules/utils.js');
const { glitchApi } = require('../custom_node_modules/apis.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Provides a random joke!'),
  async execute(interaction) {
    try {
      deferReply(interaction, 'placeholder', true);
      const embed = await glitchApi(false, 'joke', 'Jokes');
      await editReply(interaction, embed);
    } catch (e) {
      //error
    }
  },
};
