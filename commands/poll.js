"use strict";
const {
  emotes,
  capFirst,
  sMsg,
  makeEmbed,
  getHelp,
  parseQuote,
  countQuote,
} = require("../custom_nodemods/utils.js");

exports.run = async (client, msg, args, discord, infoObj) => {
  const count = countQuote(infoObj);
  //Makes sure there are only 4 quotes
  if (count === 4) {
    //easier split for quates
    const fArgs = parseQuote(infoObj, "poll");
    const question = fArgs[1];
    const options = fArgs[3].split(",");
    let str = ``;
    const newEmoteArr = [];
    options.forEach((obj, i) => {
      newEmoteArr.push(emotes[i]);
      str += `${emotes[i]} - ${capFirst(obj)}\n\n`;
    });
    const embed = makeEmbed(`${question}`, `${str}`);
    sMsg(msg.channel, embed, true, newEmoteArr);
  } else {
    getHelp(msg.channel, "poll");
  }
};
