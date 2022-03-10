"use strict";
const { sMsg, getChannel } = require("../custom_nodemods/utils.js");
const { mongoQuery } = require("../custom_nodemods/mongoCon.js");
exports.run = async (client, message, args, discord, infoObj) => {
  const res = await mongoQuery({ guildId: infoObj.guildID }, "prison");
  if (res.length === 0) {
    sMsg(
      message.channel,
      `Sweety Pie <@${message.author.id}> I am your mother,I brought you into this world and I can take you out of it!`
    );
  } else {
    sMsg(
      message.channel,
      `Sweety Pie <@${message.author.id}> I am your mother,I brought you into this world and I can take you out of it!`
    );

    sMsg(
      getChannel(res[0].prisonId, infoObj),
      `<@${message.author.id}> you belong here`
    );
  }
};
