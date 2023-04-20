'use strict';
const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const {
  makeEmbed,
  reply,
  deferReply,
  editReply,
} = require('../custom_node_modules/utils');

const getSteamContent = async gameTitle => {
  let returnVal = '';
  let embedBool = true;
  const gameTitleJoined = gameTitle.split(' ').join('+').toLowerCase();
  const reg1 = new RegExp(`sorry`);
  const reg2 = new RegExp(`/app/`);
  const getIdUrl = `https://steamcharts.com/search/?q=${gameTitleJoined}`;
  const res1 = await axios.get(getIdUrl);
  const inLinedata = res1.data.toLowerCase();
  if (reg1.test(inLinedata)) {
    returnVal = "Momma can't seem to find that game on steam.";
    embedBool = false;
  } else {
    const appId = res1?.data
      .split('\n')
      .map(entry => {
        if (reg2.test(entry)) {
          return entry;
        }
      })
      .filter(entry => {
        if (entry !== undefined) return entry;
      })[0]
      .split('/app/')[1]
      .split('">')[0];
    const playerCountUrl = `http://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v0001/?appid=${appId}`;
    // const infoUrl = `https://steamcharts.com/app/${appId}`;
    const res2 = await axios
      .get(playerCountUrl)
      .then(resp => {
        return resp?.data?.response?.result;
      })
      .catch(e => {
        return e?.response?.data?.response?.result;
      });
    const playerCount = res2;
    const a = `Current player count: ${playerCount}`;
    returnVal = makeEmbed(`Game info for: ${gameTitle}`, a);
  }
  return [returnVal, embedBool];
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('steam')
    .setDescription('Gets steam number of players active for a game.')
    .addStringOption(option =>
      option
        .setName('game')
        .setDescription('Enter the name of a game.')
        .setRequired(true)
        .setMinLength(1)
    ),
  async execute(interaction) {
    try {
      const gameTitle = interaction.options.getString('game');
      deferReply(interaction, 'placeholder', true);
      const [steamEmbed, found] = await getSteamContent(gameTitle);
      await editReply(interaction, steamEmbed, found);
    } catch (e) {
      //error
    }
  },
};
