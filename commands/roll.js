"use strict";
const {
  sMsg,
  randomInt,
  getHelp,
  makeEmbed,
} = require("../custom_nodemods/utils.js");
const config = require("../config.json");
exports.run = async (client, msg, args, discord, infoObj) => {
  if (args[0] !== undefined) {
    const lower = infoObj.msg.toLowerCase().split(" ").join("").split("d");
    const multi = lower[0].split(`${config.prefix}roll`)[1];
    const die = Number.parseInt(lower[1], 10);
    if (typeof die === "number" && die <= 90071992547409) {
      let str = ``;
      if (+multi > 0) {
        for (let i = 0; i < +multi; i++) {
          str += `Rolled ${randomInt(0, die)} \n`;
        }
      } else {
        str = ` ${randomInt(0, die)} `;
      }
      const embed = makeEmbed(`Dice Roll!`, str);
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
