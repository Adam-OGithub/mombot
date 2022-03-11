"use strict";
const axios = require("axios");
const {
  sMsg,
  makeEmbed,
  errHandler,
  capFirst,
} = require("../custom_nodemods/utils.js");
const config = require("../config.json");

exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    const reg1 = new RegExp(`sorry`);
    args.shift();
    const argSpace = args.join(" ");
    const makeUrl = args.join("+").toLowerCase();
    const reg2 = new RegExp(`/app/`);
    const getIdUrl = `https://steamcharts.com/search/?q=${makeUrl}`;
    const res1 = await axios.get(getIdUrl);
    const inLinedata = res1.data.toLowerCase();
    if (reg1.test(inLinedata)) {
      sMsg(msg.channel, "Momma can't seem to find that game on steam.");
    } else {
      const appId = res1?.data
        .split("\n")
        .map((entry) => {
          if (reg2.test(entry)) {
            return entry;
          }
        })
        .filter((entry) => {
          if (entry !== undefined) return entry;
        })[0]
        .split("/app/")[1]
        .split('">')[0];

      const playerCountUrl = `http://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v0001/?appid=${appId}`;
      const infoUrl = `https://steamcharts.com/app/${appId}`;
      const res2 = await axios.get(playerCountUrl);
      const playerCount = res2.data?.response?.player_count;
      const a = `Current player count: ${playerCount}`;
      const embed = makeEmbed(`Game info for: ${capFirst(argSpace)}`, a);
      sMsg(msg.channel, embed);
      // const res3 = await axios.get(infoUrl);
      // console.log(res3.data);
      //   const url = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/key=${config.steam.webapikey}&steamid=62591363`;
      //   const res = await axios.get(url);
      //   console.log(res.data);
    }
  } catch (e) {
    errHandler(e);
  }
};
