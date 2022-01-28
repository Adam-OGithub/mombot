"use strict";
const {
  emotes,
  capFirst,
  sMsg,
  makeEmbed,
  getHelp,
  parseQuote,
  countQuote,
  getUser,
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

    const sQ = question.split(" ");
    sQ.forEach((word, i) => {
      if (word.startsWith("<@") && word.endsWith(">")) {
        let id;
        if (word.split("")[2] === "!") {
          id = word.split("").slice(3, word.length - 1);
        } else {
          id = word.split("").slice(2, word.length - 1);
        }
        const user = getUser(id.join(""), client);
        sQ[i] = `${user.username}#${user.discriminator}`;
      }
    });
    const embed = makeEmbed(`${sQ.join(" ")}`, `${str}`);
    sMsg(msg.channel, embed, true, newEmoteArr);
  } else {
    getHelp(msg.channel, "poll");
  }
};
