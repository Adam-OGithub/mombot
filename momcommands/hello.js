"use strict";
const config = require("../config.json");
const { sMsg, makeEmbed } = require("../custom_nodemods/utils.js");
const { mongoQuery } = require("../custom_nodemods/mongoCon.js");
const axios = require("../node_modules/axios");
exports.run = async (client, message, args, discord, infoObj) => {
  let query;
  const guildIds = [];
  const channelsObj = [];
  mongoQuery({ guildId: infoObj.guildID }, "hello").then((res) => {
    if (res.length === 0) {
      //do nothing as channel does not exist for hello
    } else {
      //
      if (res[0].helloId === infoObj.channelId && message.author.bot !== true) {
        for (const [key, value] of client.guilds.cache) {
          guildIds.push(client.guilds.cache.get(key));
        }
        mongoQuery({ getAll: undefined }, "hello").then((res) => {
          res.forEach((result, i) => {
            channelsObj.push(guildIds[i].channels.cache.get(result.helloId));
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
        });
      }
    }
  });
};
