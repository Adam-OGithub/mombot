"use strict";
const config = require("../config.json");
const {
  emotes,
  capFirst,
  sMsg,
  makeEmbed,
  getHelp,
} = require("../custom_nodemods/utils.js");

exports.run = async (client, msg, args, discord, infoObj) => {
  let count = 0;
  const myCheck = infoObj.msg.split("");
  myCheck.forEach((entry) => {
    if (entry === `"`) {
      count++;
    }
  });

  if (count === 4) {
    const fArgs = infoObj.msg
      .split(`${config.prefix}poll`)[1]
      .split("")
      .map((letter) => (letter === `"` ? `^^A^^` : letter))
      .join("")
      .split("^^A^^");
    const question = fArgs[1];
    const options = fArgs[3].split(",");
    console.log(`Questions=${question}`);
    console.log(`Options=${options}`);
    let str = ``;
    const newEmoteArr = [];
    options.forEach((obj, i) => {
      newEmoteArr.push(emotes[i]);
      str += `${emotes[i]} - ${capFirst(obj)}\n\n`;
    });
    const embed = makeEmbed(`${question}`, `${str}`);
    sMsg(msg, embed, true, newEmoteArr);
  } else {
    getHelp(msg);
  }
};
