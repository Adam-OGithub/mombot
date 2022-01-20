"use strict";
const {
  emotes,
  capFirst,
  sMsg,
  makeEmbed,
  getHelp,
  getPre,
} = require("../custom_nodemods/utils.js");

exports.run = async (client, msg, args, discord, infoObj) => {
  let count = 0;
  const myCheck = infoObj.msg.split("");
  myCheck.forEach((entry) => {
    if (entry === `"`) {
      count++;
    }
  });

  //Makes sure there are only 4 quotes
  if (count === 4) {
    //easier split for quates
    const fArgs = infoObj.msg
      .split(`${getPre()}poll`)[1]
      .split("")
      .map((letter) => (letter === `"` ? `^^A^^` : letter))
      .join("")
      .split("^^A^^");
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
    getHelp(msg.channel);
  }
};
