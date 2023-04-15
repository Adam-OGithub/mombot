'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { reply } = require('../custom_node_modules/utils.js');
const { glitchApi } = require('../custom_node_modules/apis.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Provides a random quote!'),
  async execute(interaction) {
    try {
      const embed = await glitchApi(false, 'quotes', 'Quote');
      await reply(interaction, embed);
    } catch (e) {
      //error
    }
  },
};
