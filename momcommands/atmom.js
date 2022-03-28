"use strict";
const { sMsg, markovChain, capFirst } = require("../custom_nodemods/utils.js");
const { mongoQuery } = require("../custom_nodemods/mongoCon.js");
const regex = new RegExp(`[<][@]|[<][#]`);

exports.run = async (client, message, args, discord, infoObj) => {
  const res = await mongoQuery({}, "savedmsgs");
  const channelCache = client.channels.cache.get(infoObj.channelId);
  const msgCache = channelCache.messages.cache;
  const content = [];
  for (const [key, value] of msgCache) {
    if (regex.test(value.content) !== true) {
      content.push(value.content);
    }
  }
  //
  res.forEach((saved) => {
    content.push(saved.sentence);
  });

  const sentence = `${capFirst(markovChain(content.join(" ")))}.`;
  sMsg(message.channel, sentence);
};
