'use strict';
const { SlashCommandBuilder } = require('discord.js');
const config = require('../config.json');
const axios = require('axios');
const {
  makeEmbed,
  capFirst,
  reply,
} = require('../custom_node_modules/utils.js');

const oxDefine = async word => {
  let embedBool = true;
  let resultVal = '';
  const options = {
    headers: {
      app_id: config.oxford.appid,
      app_key: config.oxford.key,
    },
  };

  const response = await axios.get(
    `https://od-api.oxforddictionaries.com/api/v2/entries/en-us/${word}`,
    options
  );

  if (response?.status !== 200) {
    resultVal = 'Word not found.';
    embedBool = false;
  } else {
    let mainExample = `Not found`;
    let slangExample = `Not found`;
    const fullData = response?.data?.results;
    const result1 = fullData[0]?.lexicalEntries[0];
    const mainDef = result1?.entries[0]?.senses[0];
    const slangDef = result1?.entries[0]?.senses[1];
    const mainLongDef = mainDef?.definitions[0];
    const mainShortDef = mainDef?.shortDefinitions[0];
    const slangLongDef = slangDef?.definitions[0];
    const slangShortDef = slangDef?.shortDefinitions[0];
    let example1 = ``;
    let example2 = `\n`;
    let slangDef1 = ``;
    let slangDef2 = `\n`;

    if (mainDef?.examples) {
      mainExample = mainDef?.examples[0]?.text;
      example1 = `\n**Example:** ${capFirst(mainExample)}.\n`;
    }
    if (slangDef?.examples) {
      slangExample = slangDef?.examples[0]?.text;
      example2 = `\n**Slang example:** ${capFirst(slangExample)}`;
    }

    if (slangDef?.definitions) {
      slangDef1 = `**Slang definition:** ${capFirst(slangLongDef)}.`;
    }

    if (slangDef?.shortDefinitions) {
      slangDef2 = `\n**Slang short definition:** ${capFirst(slangShortDef)}.`;
    }

    const word = result1?.text;
    const description = `**Definition:** ${capFirst(
      mainLongDef
    )}.\n\n**Short definition:** ${capFirst(
      mainShortDef
    )}.\n${example1}\n${slangDef1}\n${slangDef2}\n${example2}`;

    resultVal = makeEmbed(`Here is info on ${capFirst(word)}`, description);
  }
  return [resultVal, embedBool];
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dic')
    .setDescription('Gets an oxford dictionary definition.')
    .addStringOption(option =>
      option
        .setName('word')
        .setDescription('Add a word here.')
        .setRequired(true)
        .setMinLength(1)
    ),
  async execute(interaction) {
    try {
      const msg = interaction.options.getString('word');
      const [definition, found] = await oxDefine(msg);
      await reply(interaction, definition, found);
    } catch (e) {
      //error
    }
  },
};
