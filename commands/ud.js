const { SlashCommandBuilder } = require('discord.js');
const ud = require('relevant-urban');
const { makeEmbed, reply } = require('../custom_node_modules/utils');

const udDefine = async phrase => {
  let returnVal = '';
  let found = true;
  let defin = await ud(phrase).catch(e => {
    returnVal = `Word not found!`;
    found = false;
  });

  if (defin?.word && defin?.definition) {
    returnVal = makeEmbed(
      defin?.word,
      defin?.definition,
      undefined,
      defin?.urbanURL
    );
  }
  return [returnVal, found];
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ud')
    .setDescription('Gets an urban dictionary definition.')
    .addStringOption(option =>
      option
        .setName('phrase')
        .setDescription('Add a phrase or word here.')
        .setRequired(true)
        .setMinLength(1)
    ),
  async execute(interaction) {
    try {
      const msg = interaction.options.getString('phrase');
      const [definition, found] = await udDefine(msg);
      await reply(interaction, definition, found);
    } catch (e) {
      //error
    }
  },
};
