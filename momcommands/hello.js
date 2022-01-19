"use strict";
const config = require("../config.json");
const { sMsg, makeEmbed } = require("../custom_nodemods/utils.js");
const axios = require("../node_modules/axios");
exports.run = async (client, message, discord, infoObj) => {
  const myReq = {};
  const guildIds = [];
  const channelsObj = [];
  myReq.query = `SELECT helloid FROM hello WHERE guildid = "${infoObj.guildID}"`;

  axios.post(config.web.dburl, myReq).then((res) => {
    let out;
    if (res?.data?.result !== undefined) {
      out = res?.data?.result[0]?.helloid;
    }
    if (
      out !== null &&
      out !== undefined &&
      out === infoObj.channelId &&
      message.author.bot !== true
    ) {
      //if query returns channelid is same as hello
      for (const [key, value] of client.guilds.cache) {
        guildIds.push(client.guilds.cache.get(key));
        //console.log(guildIds[0]);
      }
      myReq.query = `SELECT * FROM hello`;
      axios.post(config.web.dburl, myReq).then((res) => {
        const results = res?.data?.result;
        if (results !== undefined) {
          results.forEach((result, i) => {
            channelsObj.push(guildIds[i].channels.cache.get(result.helloid));
          });
          channelsObj.forEach((channelObj) => {
            if (channelObj?.id && channelObj?.id !== infoObj?.channelId) {
              const embeded = makeEmbed(
                `Hello "${infoObj?.guildName}"- "${message.author.tag}"`,
                ` ${infoObj?.msg} `
              );
              sMsg(channelObj, embeded);
            }
          });
        }
      });
    }
  });
};
