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
        'https://m.media-amazon.com/images/M/MV5BZDI4MWYzOGQtNjhiZC00ZTQxLWEzMTItOGJlOTYzY2IwOGI0XkEyXkFqcGdeQXRyYW5zY29kZS13b3JrZmxvdw@@._V1_.jpg'
      );
      await reply(interaction, embed);
    } catch (e) {
      //error
    }
  },
};
