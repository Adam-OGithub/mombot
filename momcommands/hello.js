"use strict";
const config = require("../config.json");
const { sMsg, makeEmbed } = require("../custom_nodemods/utils.js");
const { mongoQuery } = require("../custom_nodemods/mongoCon.js");
const axios = require("../node_modules/axios");
exports.run = async (client, message, args, discord, infoObj) => {
  let query;
  const guildIds = [];
  const channelsObj = [];
  //myReq.query = `SELECT helloid FROM hello WHERE guildid = "${infoObj.guildID}"`;

  // axios.post(config.web.dburl, myReq).then((res) => {
  //   let out;
  //   if (res?.data?.result !== undefined) {
  //     out = res?.data?.result[0]?.helloid;
  //   }
  //   if (
  //     out !== null &&
  //     out !== undefined &&
  //     out === infoObj.channelId &&
  //     message.author.bot !== true
  //   ) {
  //     //if query returns channelid is same as hello
  //     for (const [key, value] of client.guilds.cache) {
  //       guildIds.push(client.guilds.cache.get(key));
  //     }
  //     myReq.query = `SELECT * FROM hello`;
  //     axios.post(config.web.dburl, myReq).then((res) => {
  //       const results = res?.data?.result;
  //       if (results !== undefined) {
  //         results.forEach((result, i) => {
  //           channelsObj.push(guildIds[i].channels.cache.get(result.helloid));
  //         });
  //         channelsObj.forEach((channelObj) => {
  //           if (channelObj?.id && channelObj?.id !== infoObj?.channelId) {
  //             const embeded = makeEmbed(
  //               `Hello "${infoObj?.guildName}"- "${message.author.tag}"`,
  //               ` ${infoObj?.msg} `
  //             );
  //             sMsg(channelObj, embeded);
  //           }
  //         });
  //       }
  //     });
  //   }
  // });
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
