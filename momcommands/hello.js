"use strict";
const { sMsg, makeEmbed, makeClean } = require("../custom_nodemods/utils.js");
const { mongoQuery, mongoInsert } = require("../custom_nodemods/mongoCon.js");

exports.run = async (client, message, args, discord, infoObj) => {
  if (infoObj.helloCount === 30) {
    await mongoInsert({ sentence: makeClean(infoObj.msg) }, "savedmsgs");
  }

  const guildIds = [];
  const channelsObj = [];
  //checks if current guild has hello enabled
  const res1 = await mongoQuery({ guildId: infoObj.guildID }, "hello");
  if (res1.length === 0) {
    //do nothing as channel does not exist for hello
  } else {
    //
    if (res1[0].helloId === infoObj.channelId && message.author.bot !== true) {
      //search all hello guilds
      const res2 = await mongoQuery({ getAll: undefined }, "hello");
      for (const [key, value] of client.guilds.cache) {
        guildIds.push(client.guilds.cache.get(key));
      }
      //for each guild in cache check if channel is in that guild
      guildIds.forEach((guild) => {
        res2.forEach((entry) => {
          let check = guild.channels.cache.get(entry.helloId);
          if (check !== undefined) {
            channelsObj.push(check);
          }
        });
      });
      //for each channels found send message but not in the same channel originated from
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
  }
};
