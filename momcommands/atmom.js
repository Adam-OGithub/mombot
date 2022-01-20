"use strict";
const {
  sMsg,
  markovChain,
  capFirst,
  randomWord,
} = require("../custom_nodemods/utils.js");
exports.run = async (client, message, args, discord, infoObj) => {
  const channelCache = client.channels.cache.get(infoObj.channelId);
  const msgCache = channelCache.messages.cache;
  let str = ``;
  for (const [key, value] of msgCache) {
    let val = value.content;
    let valSplit = val.split(" ");
    valSplit.forEach((word, i) => {
      if (
        (word.startsWith("<@") && word.endsWith(">")) ||
        (word.startsWith("<#") && word.endsWith(">"))
      ) {
        valSplit[i] = `\n`;
      }
      str += ` ${valSplit.join(" ")}`;
    });
  }
  //
  const sentence = markovChain(str);
  const pick = sentence.split("\n");
  sMsg(message.channel, `${capFirst(randomWord(pick))}.`);
};
