'use strict';
const { SlashCommandBuilder } = require('discord.js');
const {
  reply,
  makeEmbed,
  randomInt,
} = require('../custom_node_modules/utils.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flips a coin!'),
  async execute(interaction) {
    try {
      const num = randomInt(0, 2);
      let fliped = '';
      const heads =
        'https://upload.wikimedia.org/wikipedia/commons/0/0a/George_Washington_Presidential_%241_Coin_obverse.png';
      const tails =
        'https://lirp.cdn-website.com/ec7d6ddb/dms3rep/multi/opt/1999-2006-native-american-one-dollar-uncirculated-reverse-1920w.jpg';

      if (num === 1) {
        fliped = heads;
      } else {
        fliped = tails;
      }
      const embed = makeEmbed('Coin flip', '🪙', undefined, undefined, fliped);
      await reply(interaction, embed);
    } catch (e) {
      //error
    }
  },
};
