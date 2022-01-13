"use strict";
const {
  sMsg,
  randomInt,
  getHelp,
  makeEmbed,
} = require("../custom_nodemods/utils.js");
exports.run = async (client, msg, args, discord, infoObj) => {
  if (args[0] !== undefined) {
    const lower = infoObj.msg.toLowerCase().split(" ").join("").split("d");
    const die = Number.parseInt(lower[1], 10);
    if (typeof die === "number" && die <= 90071992547409) {
      const embed = makeEmbed(`Dice Roll!`, `${randomInt(0, die)}`);
      sMsg(msg.channel, embed);
    } else if (die > 90071992547409) {
      sMsg(
        msg.channel,
        `Wow there honey slow down your roll, that is to big of a number.`
      );
    } else {
      sMsg(
        msg.channel,
        `It has to be a number sweety, Does momma need to teach you how to count? https://youtu.be/_Qz68dtBiO4`
      );
    }
  } else {
    const embed = makeEmbed(`Dice Roll!`, `${randomInt(0, 100)}`);
    sMsg(msg.channel, embed);
  }
};
