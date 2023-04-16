'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { reply, makeEmbed } = require('../custom_node_modules/utils.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('momscode')
    .setDescription('Provides a link to moms open source project.'),
  async execute(interaction) {
    try {
      const embed = makeEmbed(
        'Moms Code',
        'This is the Github for me sweety, I love you!',
        undefined,
        'https://github.com/Adam-OGithub/mombot',
        'https://lh3.googleusercontent.com/SFIj6M4Tz8koUg9IcZPM4vUl_hilOpiqaBuuudUOOdONVj2doCUFQaAyUiFeSqkzPom0bQ=s88'
      );
      await reply(interaction, embed);
    } catch (e) {
      //error
    }
  },
};
